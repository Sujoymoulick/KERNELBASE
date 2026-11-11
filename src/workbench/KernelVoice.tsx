import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWb } from './store';
import { kb, basename } from './bridge';
import { Icon } from './icons';
import { KernelRobot, RobotState } from './KernelRobot';
import { ensureTrust, getTrust, modeFor } from './trust';

type Phase = 'greeting' | 'listening' | 'thinking' | 'speaking' | 'idle' | 'error';
const GREETING = 'Hey, I am Kernel here. How can I help you today?';

export type VoiceStyle = 'deep' | 'male' | 'female';
const VOICE_KEY = 'kb.kernel.voice';
export const VOICE_STYLES: Record<VoiceStyle, { label: string; names: string[]; pitch: number; rate: number }> = {
  deep: { label: 'Deep male', names: ['Evan', 'Aaron', 'Daniel', 'Tom', 'Alex', 'Reed', 'Ralph', 'Fred', 'Rocko'], pitch: 0.72, rate: 0.95 },
  male: { label: 'Male', names: ['Aaron', 'Evan', 'Daniel', 'Tom', 'Alex', 'Reed', 'Fred'], pitch: 1, rate: 1.02 },
  female: { label: 'Female', names: ['Samantha', 'Ava', 'Allison', 'Zoe', 'Karen', 'Moira', 'Serena'], pitch: 1, rate: 1.02 },
};
export function getVoiceStyle(): VoiceStyle {
  try {
    const v = localStorage.getItem(VOICE_KEY) as VoiceStyle | null;
    return v && v in VOICE_STYLES ? v : 'deep';
  } catch {
    return 'deep';
  }
}
export function setVoiceStyle(v: VoiceStyle) {
  try {
    localStorage.setItem(VOICE_KEY, v);
  } catch {
    /* storage unavailable */
  }
}

function pickVoice(style: VoiceStyle): SpeechSynthesisVoice | undefined {
  const vs = (window.speechSynthesis?.getVoices() || []).filter((v) => v.lang.startsWith('en'));
  // Prefer higher-quality (Enhanced / Premium) variants of the preferred names, in order
  for (const name of VOICE_STYLES[style].names) {
    const matches = vs.filter((v) => v.name === name || v.name.startsWith(`${name} `));
    const best = matches.find((v) => /premium|enhanced/i.test(v.name)) || matches[0];
    if (best) return best;
  }
  return vs.find((v) => v.lang === 'en-US') || vs[0];
}

// Start loading macOS voices as soon as the app opens, so turning voice on is instant
try {
  window.speechSynthesis?.getVoices();
} catch {
  /* speech unavailable */
}

/** Resolves once macOS voices are loaded (they arrive asynchronously on first use). */
function voicesReady(timeout = 1200): Promise<void> {
  const synth = window.speechSynthesis;
  if (!synth || synth.getVoices().length) return Promise.resolve();
  return new Promise((resolve) => {
    const t0 = Date.now();
    // voiceschanged is not always delivered in Electron, so poll as well
    const iv = setInterval(() => {
      if (synth.getVoices().length || Date.now() - t0 > timeout) {
        clearInterval(iv);
        resolve();
      }
    }, 50);
  });
}

/**
 * Wakes the speech engine with a silent utterance. Without this the first real sentence after
 * turning voice on is often clipped or garbled while the audio device spins up.
 */
let engineWarm = false;
function warmSpeechEngine(): Promise<void> {
  const synth = window.speechSynthesis;
  if (!synth || engineWarm) return Promise.resolve();
  engineWarm = true;
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance('.');
    u.volume = 0;
    u.rate = 2;
    const v = pickVoice(getVoiceStyle());
    if (v) u.voice = v;
    u.onend = u.onerror = () => resolve();
    synth.speak(u);
    setTimeout(resolve, 500);
  });
}

/** Speaks text; resolves when finished (or after a timeout if speech is unavailable). */
async function speak(text: string, onWord?: () => void): Promise<void> {
  const synth = window.speechSynthesis;
  if (!synth || !text) return;
  if (synth.speaking || synth.pending) {
    // speak() straight after cancel() can drop or garble the start of the new sentence
    synth.cancel();
    await new Promise((r) => setTimeout(r, 80));
  }
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text.replace(/[`*#_>$\\]/g, ''));
    const style = getVoiceStyle();
    const v = pickVoice(style);
    if (v) u.voice = v;
    u.pitch = VOICE_STYLES[style].pitch;
    u.rate = VOICE_STYLES[style].rate;
    let done = false;
    const end = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = end;
    u.onerror = end;
    u.onboundary = () => onWord?.();
    // Keep a reference: Chromium can garbage-collect a playing utterance and never fire onend
    (window as any).__kbUtterance = u;
    synth.speak(u);
    setTimeout(end, Math.min(60000, 1500 + text.length * 90));
  });
}

interface Brief {
  request: string;
  answers: string[];
  plan: string;
  stage: 'asking' | 'planning' | 'confirm';
}
const YES = /\b(yes|yeah|yep|yup|sure|ok|okay|go|start|do it|build it|sounds good|looks good|perfect|proceed|let's go|go ahead|correct|right|fine)\b/i;
const NOT_YES = /\b(no|not|don't|wait|change|instead|but)\b/i;
const CANCEL = /\b(cancel|never ?mind|forget it|stop the plan)\b/i;
const SKIP = /\b(skip|no questions|just build|just do it|you decide|your choice|surprise me)\b/i;

interface Turn {
  who: 'you' | 'kernel';
  text: string;
  at: number;
  error?: boolean;
  secs?: number;
  kind?: 'quick' | 'build';
  tag?: string;
}

const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const KernelVoice: React.FC = () => {
  const wb = useWb();
  const [phase, setPhase] = useState<Phase>('greeting');
  const [partial, setPartial] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState('');
  const [typed, setTyped] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [files, setFiles] = useState<{ file: string; exists: boolean }[]>([]);
  const [level, setLevel] = useState(0); // bumps on each spoken/heard word to drive the waveform
  const [kind, setKind] = useState<'quick' | 'build' | ''>('');
  const alive = useRef(true);
  const empties = useRef(0);
  const busy = useRef(false);
  const queued = useRef('');
  const brief = useRef<Brief | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wbRef = useRef(wb);
  wbRef.current = wb;
  const [stage, setStage] = useState<'' | Brief['stage']>('');
  const logRef = useRef<HTMLDivElement>(null);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;
  const rootRef = useRef(wb.root);
  rootRef.current = wb.root;
  const statsRef = useRef(wb.setKernelStats);
  statsRef.current = wb.setKernelStats;

  useEffect(() => statsRef.current((s) => ({ ...s, phase })), [phase]);

  const say = useCallback(async (text: string) => {
    setPhase('speaking');
    await speak(text, () => setLevel((l) => l + 1));
  }, []);

  const listen = useCallback(async () => {
    if (!alive.current || busy.current) return;
    setPartial('');
    setError('');
    setPhase('listening');
    const r = await kb.kernel.listenStart();
    if (!r?.success) {
      setError(r?.error || 'Voice input is not available. Type your request below.');
      setPhase('error');
    }
  }, []);

  /** One agent turn: shows progress, handles errors, speaks and returns the reply (null on failure). */
  const agentTurn = useCallback(
    async (k: 'quick' | 'build', prompt: string, opts: { ack?: string; tag?: string; raw?: boolean } = {}) => {
      let mode: 'accept-edits' | 'auto' | undefined;
      if (k === 'build') {
        // One-time permission for this folder; never asked again afterwards
        const t = rootRef.current ? await ensureTrust(rootRef.current) : 'edits';
        if (!t) {
          await say('I need your permission to change files in this folder. Start again when you are ready.');
          return null;
        }
        mode = modeFor(t);
      }
      setKind(k);
      setFiles([]);
      setElapsed(0);
      const history = turnsRef.current
        .filter((t) => !t.error)
        .slice(-8)
        .map((t) => `${t.who === 'you' ? 'User' : 'Kernel'}: ${t.text}`)
        .join('\n');
      if (opts.ack) {
        // Instant acknowledgement so the user is never waiting in silence
        setTurns((t) => [...t, { who: 'kernel', text: opts.ack!, at: Date.now() }]);
        speak(opts.ack, () => setLevel((l) => l + 1));
      }
      setPhase('thinking');
      const t0 = Date.now();
      const timer = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
      const r = await kb.kernel.ask({ text: prompt, cwd: rootRef.current || undefined, kind: k, history, mode });
      clearInterval(timer);
      setKind('');
      if (!alive.current) return null;
      const secs = Math.round(r?.seconds || (Date.now() - t0) / 1000);
      if (k === 'build') {
        wb.refreshTree();
        wb.refreshGit();
        wb.syncFromDisk();
      }
      statsRef.current((s) => ({ ...s, turns: s.turns + 1, [k === 'build' ? 'buildSecs' : 'quickSecs']: secs }));
      if (r?.cancelled) {
        setTurns((t) => [...t, { who: 'kernel', text: 'Stopped.', at: Date.now() }]);
        return null;
      }
      if (!r?.success) {
        const msg = `That did not work. ${r?.error || ''}`.trim();
        setTurns((t) => [...t, { who: 'kernel', text: msg, at: Date.now(), error: true }]);
        wb.log('Kernel', msg, 'error');
        await say('Sorry, that did not work. The details are on screen.');
        return null;
      }
      const reply = r.response || 'Done.';
      if (opts.raw) return reply; // caller handles it (e.g. saves Markdown) and speaks its own summary
      setTurns((t) => [...t, { who: 'kernel', text: reply, at: Date.now(), secs, kind: k, tag: opts.tag }]);
      wb.log('Kernel', `Kernel (${opts.tag || k}, ${secs}s): ${reply}`, 'ok');
      await say(reply);
      return reply;
    },
    [say, wb]
  );

  const startBuild = useCallback(
    async (b: Brief) => {
      brief.current = null;
      setStage('');
      const folder = rootRef.current ? basename(rootRef.current) : 'your home folder';
      const spec = [
        'Build this now in the open folder.',
        `Request: ${b.request}`,
        b.answers.length ? `The user's answers to your questions: ${b.answers.join(' / ')}` : '',
        b.plan ? `Agreed plan: ${b.plan}` : 'No questions were asked: choose sensible defaults.',
        'Create every file completely so it runs right away. When done, say in 1 or 2 spoken sentences what you made and how to open or run it.',
      ]
        .filter(Boolean)
        .join('\n');
      await agentTurn('build', spec, { ack: `Great, building it now in ${folder}. I will tell you when it is ready.`, tag: 'Build' });
    },
    [agentTurn]
  );

  const runTurn = useCallback(
    async (text: string) => {
      kb.kernel.listenStop();
      setPhase('thinking');
      setPartial('');
      wb.log('Kernel', `You: ${text}`);
      setTurns((t) => [...t, { who: 'you', text, at: Date.now() }]);
      const b = brief.current;

      // Planning conversation for a new project: questions -> plan -> go-ahead -> build
      if (b) {
        if (CANCEL.test(text)) {
          brief.current = null;
          setStage('');
          await say('Okay, cancelled. What would you like to do instead?');
          return;
        }
        if (b.stage === 'confirm' && YES.test(text) && !NOT_YES.test(text)) return startBuild(b);
        if (b.stage === 'asking' && SKIP.test(text)) return startBuild(b);
        b.answers.push(text);
        b.stage = 'planning';
        setStage('planning');
        const plan = await agentTurn(
          'quick',
          [
            `Project request: ${b.request}`,
            `The user's answers and changes so far: ${b.answers.join(' / ')}`,
            'Describe your build plan out loud in 3 to 5 short sentences: what you will make, the main features, and the files or stack.',
            'End with exactly: Shall I start building?',
            'Do not build anything yet. This reply may be up to 6 sentences.',
          ].join('\n'),
          { tag: 'Plan' }
        );
        if (plan) {
          b.plan = plan;
          b.stage = 'confirm';
          setStage('confirm');
        } else {
          b.stage = 'asking';
          setStage('asking');
        }
        return;
      }

      const route: 'quick' | 'build' | 'project' | 'docs' = (await kb.kernel.classify(text)) || 'quick';
      if (route === 'docs') {
        if (!rootRef.current) {
          await say('Open a project folder first, then ask me again.');
          return;
        }
        setTurns((t) => [...t, { who: 'kernel', text: 'Writing the project documentation for your Resources rack...', at: Date.now() }]);
        speak('Sure, writing the project documentation now.', () => setLevel((l) => l + 1));
        const md = await agentTurn(
          'quick',
          [
            `Write Markdown documentation for the project in this folder (${rootRef.current}). Read the project files first.`,
            `What the user asked for: ${text}`,
            'Include: # title, overview, features, tech stack, setup and run steps, file structure, and next steps.',
            'This reply is saved as a .md file, NOT spoken: reply with the Markdown document only, no preamble.',
          ].join('\n'),
          { raw: true, tag: 'Docs' }
        );
        if (!md) return;
        const name = /readme/i.test(text) ? 'README' : 'Project documentation';
        const res = await kb.resources.saveMarkdown(rootRef.current, name, md.replace(/^```(?:markdown|md)?\s*|\s*```\s*$/g, ''));
        const msg = res?.success ? `Done. I saved ${name}.md to your Resources rack. Open the Resources tab to read it.` : `I wrote the documentation but could not save it: ${res?.error || 'unknown error'}`;
        setTurns((t) => [...t, { who: 'kernel', text: msg, at: Date.now(), tag: 'Docs', kind: 'quick', error: !res?.success }]);
        if (res?.success) wb.setLayout({ studioOpen: true, studioTab: 'resources' });
        await say(msg);
        return;
      }
      if (route === 'project') {
        const nb: Brief = { request: text, answers: [], plan: '', stage: 'asking' };
        brief.current = nb;
        setStage('asking');
        const q = await agentTurn(
          'quick',
          [
            `The user wants you to build: ${text}`,
            'Before planning, ask them the 2 or 3 short questions that matter most (key features, look and feel, tech stack, or anything unclear).',
            'Ask them all in one short spoken reply, numbered first, second, third. Do not build or plan yet.',
          ].join('\n'),
          { tag: 'Questions' }
        );
        if (!q) {
          brief.current = null;
          setStage('');
        }
        return;
      }
      if (route === 'build') {
        const folder = rootRef.current ? basename(rootRef.current) : 'your home folder';
        await agentTurn('build', text, { ack: `On it. I am working in ${folder} now, I will tell you when it is ready.` });
        return;
      }
      await agentTurn('quick', text);
    },
    [agentTurn, startBuild, say, wb]
  );
  const ask = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;
      if (busy.current) {
        // Kernel is still talking: stop the speech and take the new request next
        queued.current = text;
        window.speechSynthesis?.cancel();
        return;
      }
      busy.current = true;
      try {
        await runTurn(text);
      } finally {
        busy.current = false;
      }
      const next = queued.current;
      queued.current = '';
      if (next && alive.current) return askRef.current(next);
      if (alive.current) listen();
    },
    [listen, runTurn]
  );

  const askRef = useRef(ask);
  askRef.current = ask;

  // Speech + file events from the main process
  useEffect(() => {
    const off1 = kb.kernel.onListen((e: { type: string; text?: string; message?: string }) => {
      if (!alive.current || (busy.current && e.type !== 'error')) return;
      if (e.type === 'partial') {
        setPartial(e.text || '');
        setLevel((l) => l + 1);
      } else if (e.type === 'final') {
        const text = (e.text || '').trim();
        // Ignore stray one-word pickups (background noise, "uh") so they do not start a turn
        if (text.split(/\s+/).length >= 2) askRef.current(text);
        else if (++empties.current < 3) listen();
        else setPhase('idle');
      } else if (e.type === 'error') {
        setError(e.message || 'Voice input failed.');
        setPhase('error');
      }
    });
    const off2 = kb.kernel.onFile((e: { file: string; exists: boolean }) => {
      setFiles((f) => (f.some((x) => x.file === e.file) ? f : [...f, e]));
      statsRef.current((s) => ({ ...s, files: s.files + 1 }));
      // Keep the explorer and open editors in sync while Kernel writes files
      clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        wbRef.current.refreshTree();
        wbRef.current.syncFromDisk();
      }, 500);
    });
    return () => {
      off1();
      off2();
    };
  }, [listen]);

  // Session start: greet, then listen
  useEffect(() => {
    alive.current = true;
    statsRef.current({ startedAt: Date.now(), turns: 0, phase: 'greeting', files: 0 });
    setTurns([{ who: 'kernel', text: GREETING, at: Date.now() }]);
    const warmAgents = () =>
      kb.kernel.warm({ cwd: rootRef.current || undefined, mode: rootRef.current && getTrust(rootRef.current) ? modeFor(getTrust(rootRef.current)) : undefined }).then((r: { success: boolean; error?: string }) => {
        if (r && !r.success && alive.current) setTurns((t) => [...t, { who: 'kernel', text: r.error || 'Antigravity CLI is not available.', at: Date.now(), error: true }]);
      });
    const t = setTimeout(async () => {
      // Load voices and wake the speech engine first, so the greeting comes out clean
      await voicesReady();
      await warmSpeechEngine();
      if (!alive.current) return;
      // Start the Antigravity sessions as the greeting begins (they run at low priority in the
      // background) so the first answer is fast without making the greeting stutter
      const greeting = say(GREETING);
      setTimeout(warmAgents, 600);
      await greeting;
      listen();
    }, 150);
    return () => {
      alive.current = false;
      clearTimeout(t);
      window.speechSynthesis?.cancel();
      kb.kernel.stop();
      statsRef.current((s) => ({ ...s, phase: '' }));
    };
  }, [say, listen]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, partial]);

  const end = () => wb.setLayout({ voiceOn: false });
  const folder = wb.root ? basename(wb.root) : 'your folder';
  const status =
    phase === 'listening'
      ? stage === 'asking'
        ? 'Answer the questions. Take your time...'
        : stage === 'confirm'
          ? 'Say "yes" to start building, or tell me what to change'
          : 'Listening. Pause or say "go ahead" when you are done'
      : phase === 'thinking'
        ? kind === 'build'
          ? `Building in ${folder}... ${elapsed}s`
          : stage === 'planning'
            ? `Making a plan... ${elapsed}s`
            : `Thinking... ${elapsed}s` : phase === 'speaking' || phase === 'greeting' ? 'Speaking' : phase === 'error' ? 'Voice input unavailable' : 'Paused. Press the mic to talk.';
  const robotState: RobotState = phase === 'greeting' ? 'speaking' : phase;

  return (
    <div className="kb-kernel-overlay" data-testid="kernel-voice">
      <div className="kb-kernel-badge">
        <span className="kb-dot" style={{ width: 6, height: 6, background: phase === 'error' ? 'var(--err)' : 'var(--accent-fg)' }} />
        Kernel Voice Active
      </div>

      <div className="kb-kernel-stage">
        <KernelRobot state={robotState} beat={level} size={170} />
        <div className="kb-kernel-name">Kernel</div>
        <div className="kb-kernel-state" data-testid="kernel-phase" data-phase={phase}>
          <span className="kb-dot" style={{ width: 6, height: 6, background: phase === 'error' ? 'var(--err)' : phase === 'thinking' ? '#b180d7' : 'var(--accent-fg)' }} />
          {status}
        </div>

        {phase === 'thinking' && kind === 'build' && (
          <div className="kb-kernel-steps">
            <div className="step done"><Icon name="check" size={13} /> Reading {folder}</div>
            {files.slice(-5).map((f) => (
              <div key={f.file} className="step done">
                <Icon name={f.exists ? 'check' : 'trash'} size={13} /> {f.exists ? 'Wrote' : 'Removed'} {f.file}
              </div>
            ))}
            <div className="step now">
              <span className="spin" /> {files.length ? 'Still working...' : 'Thinking...'}
            </div>
          </div>
        )}
      </div>

      <div className="kb-kernel-log select-text" ref={logRef}>
        {turns.map((t, i) => (
          <div key={i} className={`turn ${t.who} ${t.error ? 'err' : ''}`}>
            <div className="meta">
              <b>{t.who === 'you' ? 'You' : 'Kernel'}</b> {time(t.at)}
              {t.secs != null && <span className={`kb-kernel-chip ${t.kind}`}>{t.tag || (t.kind === 'build' ? 'Build task' : 'Quick answer')} · {t.secs}s</span>}
            </div>
            <div className="bubble">{t.text}</div>
          </div>
        ))}
        {phase === 'listening' && partial && (
          <div className="turn you live">
            <div className="meta"><b>You</b> now</div>
            <div className="bubble">{partial}</div>
          </div>
        )}
        {error && (
          <div className="turn kernel err">
            <div className="bubble">
              {error}
              {/permission/i.test(error) && (
                <>
                  {' '}
                  <button className="kb-link" onClick={() => kb.shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone')}>
                    Open Privacy Settings
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {stage && phase !== 'thinking' && (
        <div className="kb-kernel-plan-actions" data-testid="kernel-plan-actions">
          <span className="kb-kernel-chip build">{stage === 'asking' ? 'Planning your project' : 'Plan ready'}</span>
          <button type="button" className="kb-btn" onClick={() => brief.current && (window.speechSynthesis?.cancel(), kb.kernel.listenStop(), askRef.current('just build it'))} data-testid="kernel-build-now">
            {stage === 'asking' ? 'Skip questions, build now' : 'Start building'}
          </button>
          <button
            type="button"
            className="kb-btn secondary"
            onClick={() => {
              brief.current = null;
              setStage('');
            }}
          >
            Cancel plan
          </button>
        </div>
      )}
      <form
        className="kb-kernel-input"
        onSubmit={(e) => {
          e.preventDefault();
          const v = typed.trim();
          setTyped('');
          if (v) ask(v);
        }}
      >
        <div className="field">
          <input placeholder={phase === 'thinking' ? 'Kernel is working...' : 'Or type to Kernel...'} value={typed} onChange={(e) => setTyped(e.target.value)} disabled={phase === 'thinking'} data-testid="kernel-input" />
          <button type="submit" title="Send" disabled={phase === 'thinking' || !typed.trim()}>
            <Icon name="send" size={15} />
          </button>
        </div>
        <button
          type="button"
          className={`mic ${phase === 'listening' ? 'on' : ''}`}
          title={phase === 'listening' ? 'Stop listening and send' : 'Talk to Kernel'}
          disabled={phase === 'thinking'}
          onClick={() => (phase === 'listening' ? kb.kernel.listenStop() : (window.speechSynthesis?.cancel(), listen()))}
          data-testid="kernel-mic"
        >
          <Icon name="mic" size={18} />
        </button>
        {phase === 'thinking' ? (
          <button type="button" className="end" onClick={() => kb.kernel.cancel()}>
            <Icon name="stop" size={12} /> Stop
          </button>
        ) : (
          <button type="button" className="end" onClick={end} data-testid="kernel-end">
            <Icon name="close" size={13} /> End
          </button>
        )}
      </form>
    </div>
  );
};

/** Session card shown at the top of Agent Studio while voice is on. */
export const KernelSessionCard: React.FC<{ version?: string }> = ({ version }) => {
  const wb = useWb();
  const s = wb.kernelStats;
  const [voice, setVoice] = useState<VoiceStyle>(getVoiceStyle);
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const secs = s.startedAt ? Math.round((Date.now() - s.startedAt) / 1000) : 0;
  const row = (k: string, v: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '3px 0', fontSize: 12 }}>
      <span className="kb-muted">{k}</span>
      <span className="mono" style={{ color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
    </div>
  );
  return (
    <div className="kb-card" style={{ margin: '10px 12px 0', padding: '10px 12px', background: 'var(--side)' }} data-testid="kernel-session-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="kb-label">Kernel voice session</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent-fg)', border: '1px solid var(--accent)', borderRadius: 9, padding: '1px 7px' }}>
          {s.phase ? s.phase.replace('thinking', 'working').toUpperCase() : 'ACTIVE'}
        </span>
      </div>
      {row('Engine', `Antigravity CLI${version ? ` ${version}` : ''}`)}
      {row('Quick answers', 'Gemini 3.8 Flash Low')}
      {row('Build tasks', 'Gemini 3.8 Flash Medium')}
      {row('Workspace', wb.root ? basename(wb.root) : 'none')}
      {row('Speech', 'On-device (macOS)')}
      {row('Last reply', `${s.quickSecs != null ? `${s.quickSecs}s quick` : '-'} / ${s.buildSecs != null ? `${s.buildSecs}s build` : '-'}`)}
      {row('Session', `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, '0')}s`)}
      {row('Turns / files changed', `${s.turns} / ${s.files}`)}
      <div className="kb-label" style={{ marginTop: 8 }}>Voice</div>
      <div className="kb-voice-seg" role="radiogroup" aria-label="Kernel voice">
        {(Object.keys(VOICE_STYLES) as VoiceStyle[]).map((v) => (
          <button
            key={v}
            role="radio"
            aria-checked={voice === v}
            className={voice === v ? 'on' : ''}
            data-testid={`kernel-voice-${v}`}
            onClick={() => {
              setVoiceStyle(v);
              setVoice(v);
            }}
          >
            {VOICE_STYLES[v].label}
          </button>
        ))}
      </div>
    </div>
  );
};
