import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWb, Command } from './store';
import { kb, basename, dirname, relPath } from './bridge';
import { Icon, FileTag } from './icons';

interface Item {
  key: string;
  label: string;
  detail?: string;
  right?: string;
  icon?: React.ReactNode;
  run: () => void;
}

/** Fuzzy subsequence score: lower is better, -1 means no match. */
function score(text: string, q: string) {
  if (!q) return 0;
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct >= 0) return direct;
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const f = t.indexOf(ch, ti);
    if (f < 0) return -1;
    gaps += f - ti;
    ti = f + 1;
  }
  return 100 + gaps;
}

export const QuickInput: React.FC = () => {
  const wb = useWb();
  const quick = wb.quick!;
  const [value, setValue] = useState(quick.mode === 'commands' ? '>' : quick.mode === 'line' ? ':' : quick.initial || '');
  const [idx, setIdx] = useState(0);
  const [files, setFiles] = useState<{ name: string; relativePath: string; fullPath: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const close = () => {
    wb.setQuick(null);
    setTimeout(() => wb.editorRef.current?.focus(), 0);
  };

  const mode = value.startsWith('>') ? 'commands' : value.startsWith(':') ? 'line' : 'files';
  const q = (mode === 'files' ? value : value.slice(1)).trim().toLowerCase();

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    if (mode !== 'files' || !wb.root) return;
    const t = setTimeout(async () => {
      const r = await kb.indexing.quickOpen(wb.root, q.replace(/\s+/g, ''));
      setFiles(r?.files || []);
    }, q ? 80 : 0);
    return () => clearTimeout(t);
  }, [q, mode, wb.root]);

  const items: Item[] = useMemo(() => {
    if (mode === 'commands') {
      const all = Array.from(wb.commandsRef.current.values()) as Command[];
      return all
        .map((c) => ({ c, s: score(`${c.category ? c.category + ': ' : ''}${c.title}`, q) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => a.s - b.s || a.c.title.localeCompare(b.c.title))
        .slice(0, 80)
        .map(({ c }) => ({ key: c.id, label: `${c.category ? c.category + ': ' : ''}${c.title}`, right: c.key, run: () => wb.runCommand(c.id) }));
    }
    if (mode === 'line') {
      const n = parseInt(q, 10);
      const ed = wb.editorRef.current;
      const total = ed?.getModel()?.getLineCount() || 0;
      if (!ed) return [{ key: 'none', label: 'Open a file to go to a line', run: () => {} }];
      return [
        {
          key: 'line',
          label: n ? `Go to line ${n}` : `Type a line number between 1 and ${total}`,
          run: () => {
            if (!n) return;
            const line = Math.min(Math.max(1, n), total);
            ed.revealLineInCenter(line);
            ed.setPosition({ lineNumber: line, column: 1 });
          },
        },
      ];
    }
    const open = wb.tabs.filter((t) => t.path).map((t) => t.path!);
    const recent = !q ? open.map((p) => ({ name: basename(p), relativePath: relPath(wb.root || undefined, p), fullPath: p })) : [];
    const ranked = files
      .map((f) => ({ f, s: Math.min(score(f.name, q) >= 0 ? score(f.name, q) : 9999, score(f.relativePath, q) >= 0 ? score(f.relativePath, q) + 50 : 9999) }))
      .filter((x) => x.s < 9999)
      .sort((a, b) => a.s - b.s)
      .map((x) => x.f);
    const seen = new Set<string>();
    return [...recent, ...ranked]
      .filter((f) => (seen.has(f.fullPath) ? false : (seen.add(f.fullPath), true)))
      .slice(0, 60)
      .map((f) => ({
        key: f.fullPath,
        label: f.name,
        detail: dirname(f.relativePath) === '/' ? '' : dirname(f.relativePath),
        icon: <FileTag name={f.name} theme={wb.theme} />,
        right: open.includes(f.fullPath) && !q ? 'open' : undefined,
        run: () => wb.openFile(f.fullPath),
      }));
  }, [mode, q, files, wb]);

  useEffect(() => setIdx(0), [value]);
  useEffect(() => {
    listRef.current?.querySelector('.kb-quick-item.on')?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  const pick = (it?: Item) => {
    if (!it) return;
    close();
    setTimeout(it.run, 0);
  };

  return (
    <>
      <div className="kb-quick-backdrop" onMouseDown={close} />
      <div className="kb-quick" data-testid="quick-input">
        <input
          ref={inputRef}
          className="kb-input"
          style={{ height: 28 }}
          value={value}
          placeholder={mode === 'files' ? 'Search files by name (append : to go to line, > for commands)' : ''}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIdx((i) => Math.min(items.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIdx((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              pick(items[idx]);
            }
          }}
        />
        <div className="kb-quick-list" ref={listRef}>
          {items.map((it, i) => (
            <button key={it.key} className={`kb-quick-item ${i === idx ? 'on' : ''}`} onMouseMove={() => setIdx(i)} onClick={() => pick(it)}>
              {it.icon}
              <span>{it.label}</span>
              {it.detail && <span className="kb-muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.detail}</span>}
              {it.right && <span className="kb-kbd">{it.right}</span>}
            </button>
          ))}
          {items.length === 0 && <div className="kb-muted" style={{ padding: '6px 8px' }}>No matching results</div>}
        </div>
      </div>
    </>
  );
};

