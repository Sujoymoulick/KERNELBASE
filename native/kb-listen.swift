// kb-listen: on-device speech-to-text helper for the Kernel voice agent.
// Prints one JSON object per line on stdout:
//   {"type":"ready"} {"type":"partial","text":"..."} {"type":"final","text":"..."} {"type":"error","message":"..."}
// Usage: kb-listen [--file audio.aiff] [--silence 2.2] [--locale en-US]
// Mic mode ends the turn after a natural pause (`silence` seconds, doubled when the sentence sounds
// unfinished), an end phrase like "go ahead", "stop" on stdin, or after 3 minutes.
import AVFoundation
import Foundation
import Speech

setvbuf(stdout, nil, _IOLBF, 0)

func emit(_ obj: [String: Any]) {
    if let d = try? JSONSerialization.data(withJSONObject: obj), let s = String(data: d, encoding: .utf8) {
        print(s)
        fflush(stdout)
    }
}

let args = CommandLine.arguments
func arg(_ name: String) -> String? {
    guard let i = args.firstIndex(of: name), i + 1 < args.count else { return nil }
    return args[i + 1]
}
let filePath = arg("--file")
let silence = Double(arg("--silence") ?? "2.2") ?? 2.2
let locale = Locale(identifier: arg("--locale") ?? "en-US")

func fail(_ msg: String) -> Never {
    emit(["type": "error", "message": msg])
    exit(1)
}

guard let recognizer = SFSpeechRecognizer(locale: locale) else { fail("Speech recognition is not available for \(locale.identifier).") }

var lastText = ""
var lastChange = Date()
var finished = false

func finish(_ text: String) {
    if finished { return }
    finished = true
    emit(["type": "final", "text": text])
    exit(0)
}

// Words that usually mean the speaker has not finished the sentence yet
let continuers: Set<String> = ["and", "or", "but", "so", "because", "the", "a", "an", "to", "with", "of", "for", "in", "on", "that",
                               "which", "then", "um", "uh", "like", "also", "if", "when", "where", "my", "your", "this", "is", "are", "should", "will", "can"]
// Spoken phrases that mean "I'm done, send it"
let endPhrase = try! NSRegularExpression(pattern: "[,.\\s]*\\b(over|that's it|that is it|that's all|that is all|go ahead|send it|you can start|start now|done kernel|okay kernel)[.!]?\\s*$", options: [.caseInsensitive])

func stripEndPhrase(_ text: String) -> String? {
    let range = NSRange(text.startIndex..., in: text)
    guard let m = endPhrase.firstMatch(in: text, range: range), let r = Range(m.range, in: text) else { return nil }
    return String(text[..<r.lowerBound]).trimmingCharacters(in: .whitespaces)
}

func start() {
    if let filePath = filePath {
        let req = SFSpeechURLRecognitionRequest(url: URL(fileURLWithPath: filePath))
        if recognizer.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true }
        req.shouldReportPartialResults = false
        recognizer.recognitionTask(with: req) { result, error in
            if let r = result, r.isFinal { finish(r.bestTranscription.formattedString) }
            else if let e = error { fail(e.localizedDescription) }
        }
        return
    }

    let engine = AVAudioEngine()
    // Speech is recognised in segments: when the recogniser closes a segment on its own (long pause,
    // its own time limit) the text is committed and a new segment starts, so long explanations are kept.
    var committed = ""
    var current = ""
    var ending = false
    var restarts = 0
    var req = SFSpeechAudioBufferRecognitionRequest()
    let lock = NSLock()
    func full() -> String { [committed, current].filter { !$0.isEmpty }.joined(separator: " ") }

    func endNow(_ override: String? = nil) {
        if ending { return }
        ending = true
        if let o = override { lastText = o }
        engine.stop()
        lock.lock(); req.endAudio(); lock.unlock()
        let text = lastText
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { finish(text) }
    }

    func beginTask() {
        let r = SFSpeechAudioBufferRecognitionRequest()
        r.shouldReportPartialResults = true
        if recognizer.supportsOnDeviceRecognition { r.requiresOnDeviceRecognition = true }
        if #available(macOS 13, *) { r.addsPunctuation = true }
        lock.lock(); req = r; lock.unlock()
        recognizer.recognitionTask(with: r) { result, error in
            DispatchQueue.main.async {
                if finished || ending { return }
                if let res = result {
                    current = res.bestTranscription.formattedString
                    let text = full()
                    if text != lastText {
                        lastText = text
                        lastChange = Date()
                        emit(["type": "partial", "text": text])
                        if let stripped = stripEndPhrase(text) { endNow(stripped); return }
                    }
                    if res.isFinal { committed = full(); current = ""; restarts += 1; if restarts < 40 { beginTask() } else { endNow() } }
                } else if error != nil {
                    committed = full(); current = ""; restarts += 1
                    if restarts < 40 { beginTask() } else { endNow() }
                }
            }
        }
    }

    let input = engine.inputNode
    let format = input.outputFormat(forBus: 0)
    input.installTap(onBus: 0, bufferSize: 1024, format: format) { buf, _ in
        lock.lock(); let r = req; lock.unlock()
        r.append(buf)
    }
    engine.prepare()
    do { try engine.start() } catch { fail("Microphone could not start: \(error.localizedDescription)") }
    beginTask()
    emit(["type": "ready"])

    // End of turn: a natural pause (longer when the sentence sounds unfinished), an end phrase,
    // the mic button ("stop" on stdin), or a 3 minute cap.
    let started = Date()
    Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { _ in
        if ending { return }
        let quiet = Date().timeIntervalSince(lastChange)
        let words = lastText.lowercased().split(whereSeparator: { !$0.isLetter && $0 != "'" })
        var need = silence
        if let last = words.last, continuers.contains(String(last)) { need *= 2 }
        if words.count < 4 { need += 0.8 }
        if !lastText.isEmpty && quiet > need { endNow() }
        if Date().timeIntervalSince(started) > 180 { endNow() }
        if lastText.isEmpty && Date().timeIntervalSince(started) > 15 { endNow() }
    }
    DispatchQueue.global().async {
        while let line = readLine() {
            if line.trimmingCharacters(in: .whitespaces) == "stop" {
                DispatchQueue.main.async { endNow() }
            }
        }
    }
}

SFSpeechRecognizer.requestAuthorization { status in
    DispatchQueue.main.async {
        guard status == .authorized else {
            fail("Speech recognition permission is \(status == .denied ? "denied" : "not granted"). Allow Kernel Base in System Settings > Privacy & Security > Speech Recognition.")
        }
        if filePath != nil { start(); return }
        AVCaptureDevice.requestAccess(for: .audio) { ok in
            DispatchQueue.main.async {
                if !ok { fail("Microphone permission denied. Allow Kernel Base in System Settings > Privacy & Security > Microphone.") }
                start()
            }
        }
    }
}

RunLoop.main.run()
