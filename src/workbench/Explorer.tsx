import React, { useEffect, useRef, useState } from 'react';
import { useWb } from './store';
import { kb, fsApi, basename, dirname, joinPath, relPath, DirEntry } from './bridge';
import { Icon, FileTag } from './icons';

/* ---------- Context menu ---------- */
export interface MenuItem {
  label?: string;
  key?: string;
  run?: () => void;
  sep?: boolean;
}
export const ContextMenu: React.FC<{ x: number; y: number; items: MenuItem[]; onClose: () => void }> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('mousedown', down);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('mousedown', down);
      window.removeEventListener('keydown', key);
    };
  }, [onClose]);
  const top = Math.min(y, window.innerHeight - items.length * 26 - 16);
  const left = Math.min(x, window.innerWidth - 230);
  return (
    <div ref={ref} className="kb-menu" style={{ top, left }} role="menu">
      {items.map((it, i) =>
        it.sep ? (
          <hr key={i} />
        ) : (
          <button
            key={i}
            role="menuitem"
            onClick={() => {
              onClose();
              it.run?.();
            }}
          >
            <span>{it.label}</span>
            {it.key && <span style={{ opacity: 0.7, fontSize: 11 }}>{it.key}</span>}
          </button>
        )
      )}
    </div>
  );
};

const GIT_COLOR: Record<string, string> = { M: 'var(--modified)', A: 'var(--added)', U: 'var(--added)', D: 'var(--deleted)', R: 'var(--added)' };

const NameInput: React.FC<{ initial: string; onDone: (v: string) => void; depth: number; icon?: React.ReactNode }> = ({ initial, onDone, depth, icon }) => {
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current!;
    el.focus();
    const dot = initial.lastIndexOf('.');
    el.setSelectionRange(0, dot > 0 ? dot : initial.length);
  }, [initial]);
  const finish = (v: string) => {
    if (done.current) return;
    done.current = true;
    onDone(v);
  };
  return (
    <div className="kb-row" style={{ paddingLeft: 8 + depth * 12 }}>
      <span className="twisty" />
      {icon}
      <input
        ref={ref}
        className="kb-rename"
        defaultValue={initial}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') finish((e.target as HTMLInputElement).value);
          if (e.key === 'Escape') finish('');
        }}
        onBlur={(e) => finish(e.target.value)}
      />
    </div>
  );
};


type Pending = { dir: string; kind: 'file' | 'folder' } | null;

export const Explorer: React.FC = () => {
  const wb = useWb();
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const [creating, setCreating] = useState<Pending>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [focusRow, setFocusRow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!wb.root) {
    return (
      <div className="kb-empty">
        <p style={{ margin: '0 0 12px' }}>You have not yet opened a folder.</p>
        <button className="kb-btn full" onClick={wb.pickFolder}>Open Folder</button>
        <p style={{ margin: '16px 0 12px' }}>Or open individual files to edit them.</p>
        <button className="kb-btn full secondary" onClick={wb.pickFiles}>Open File</button>
      </div>
    );
  }
  const root = wb.root;

  const targetDir = () => {
    const sel = wb.selected;
    if (!sel) return root;
    const isDir = Object.values(wb.dirs).some((list) => list.some((e) => e.path === sel && e.isDirectory)) || sel === root;
    return isDir ? sel : dirname(sel);
  };

  const startCreate = async (kind: 'file' | 'folder', dir = targetDir()) => {
    setCollapsed(false);
    if (dir !== root) await wb.toggleDir(dir, true);
    setCreating({ dir, kind });
  };

  const commitCreate = async (name: string) => {
    const c = creating;
    setCreating(null);
    if (!c || !name.trim()) return;
    const target = joinPath(c.dir, name.trim());
    try {
      if (c.kind === 'folder') await fsApi.mkdir(target);
      else {
        // allow "src/util/new.ts" style paths
        if (name.includes('/')) await fsApi.mkdir(dirname(target));
        await fsApi.create(target);
      }
      await wb.loadDir(c.dir);
      if (name.includes('/')) await wb.loadDir(dirname(target));
      if (c.kind === 'file') wb.openFile(target);
      else wb.setSelected(target);
    } catch (e: any) {
      wb.notify(`Could not create ${name}: ${e?.message || e}`, 'error');
    }
  };

  const commitRename = async (from: string, name: string) => {
    setRenaming(null);
    if (!name.trim() || name === basename(from)) return;
    const to = joinPath(dirname(from), name.trim());
    try {
      await fsApi.rename(from, to);
      await wb.loadDir(dirname(from));
      wb.setTabs((tabs) => tabs.map((t) => (t.path === from ? { ...t, path: to, name: basename(to) } : t.path?.startsWith(from + '/') ? { ...t, path: to + t.path.slice(from.length) } : t)));
      wb.setSelected(to);
    } catch (e: any) {
      wb.notify(`Rename failed: ${e?.message || e}`, 'error');
    }
  };

  const trash = async (p: string) => {
    if (!window.confirm(`Move "${basename(p)}" to the Trash?`)) return;
    try {
      await fsApi.trash(p);
      await wb.loadDir(dirname(p));
      for (const t of wb.tabs) if (t.path === p || t.path?.startsWith(p + '/')) wb.setTabs((all) => all.filter((x) => x.id !== t.id));
    } catch (e: any) {
      wb.notify(`Could not move to Trash: ${e?.message || e}`, 'error');
    }
  };

  const openMenu = (e: React.MouseEvent, entry: DirEntry | null) => {
    e.preventDefault();
    e.stopPropagation();
    const p = entry?.path || root;
    const isDir = entry ? entry.isDirectory : true;
    wb.setSelected(p);
    const dir = isDir ? p : dirname(p);
    const items: MenuItem[] = [
      { label: 'New File...', run: () => startCreate('file', dir) },
      { label: 'New Folder...', run: () => startCreate('folder', dir) },
      { sep: true },
      { label: 'Reveal in Finder', key: '⌥⌘R', run: () => fsApi.reveal(p) },
      { label: 'Open in Integrated Terminal', run: () => wb.newTerminal(basename(dir), dir) },
      ...(!isDir ? [{ label: 'Run File', run: () => runFile(p) }] : []),
      { sep: true },
      { label: 'Copy Path', key: '⌥⌘C', run: () => navigator.clipboard.writeText(p) },
      { label: 'Copy Relative Path', key: '⌥⇧⌘C', run: () => navigator.clipboard.writeText(relPath(root, p)) },
      ...(entry
        ? [{ sep: true }, { label: 'Rename...', key: 'Enter', run: () => setRenaming(p) }, { label: 'Move to Trash', key: '⌘⌫', run: () => trash(p) }]
        : []),
    ];
    setMenu({ x: e.clientX, y: e.clientY, items });
  };

  const runFile = async (p: string) => {
    const r = await kb.project.commandForFile(p, root);
    if (r?.command) wb.runInTerminal(r.command, r.cwd);
    else wb.notify(`No runner for ${basename(p)}`, 'error');
  };

  const onKey = (e: React.KeyboardEvent) => {
    const sel = wb.selected;
    if (!sel || renaming || creating) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (sel !== root) setRenaming(sel);
    } else if ((e.key === 'Backspace' && e.metaKey) || e.key === 'Delete') {
      e.preventDefault();
      if (sel !== root) trash(sel);
    }
  };

  const renderDir = (dir: string, depth: number): React.ReactNode => {
    const list = wb.dirs[dir] || [];
    return (
      <>
        {creating?.dir === dir && (
          <NameInput
            initial=""
            depth={depth}
            icon={creating.kind === 'folder' ? <Icon name="chevronRight" size={14} /> : <Icon name="doc" size={13} />}
            onDone={commitCreate}
          />
        )}
        {list.map((e) => {
          const open = wb.expanded.has(e.path);
          if (renaming === e.path) return <NameInput key={e.path} initial={e.name} depth={depth} onDone={(v) => commitRename(e.path, v)} />;
          const status = wb.git.files?.[e.path] || (e.isDirectory && wb.git.files && Object.keys(wb.git.files).some((f) => f.startsWith(e.path + '/')) ? 'dot' : '');
          const color = status === 'dot' ? 'var(--modified)' : GIT_COLOR[status] || undefined;
          return (
            <React.Fragment key={e.path}>
              <button
                className={`kb-row ${wb.selected === e.path ? 'sel' : ''} ${focusRow ? 'focus' : ''}`}
                style={{ paddingLeft: 8 + depth * 12 }}
                data-path={e.path}
                onClick={() => {
                  wb.setSelected(e.path);
                  if (e.isDirectory) wb.toggleDir(e.path);
                  else wb.openFile(e.path);
                }}
                onContextMenu={(ev) => openMenu(ev, e)}
                title={relPath(root, e.path)}
              >
                <span className="twisty">{e.isDirectory && <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} />}</span>
                {!e.isDirectory && <FileTag name={e.name} theme={wb.theme} />}
                <span className="label" style={{ color }}>{e.name}</span>
                {status && status !== 'dot' && <span className="deco" style={{ color }}>{status}</span>}
                {status === 'dot' && <span className="deco"><span className="kb-dot" style={{ background: color, width: 6, height: 6, display: 'inline-block' }} /></span>}
              </button>
              {e.isDirectory && open && renderDir(e.path, depth + 1)}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-testid="explorer">
      <div className="kb-section-head" style={{ position: 'relative' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, height: 22 }} onClick={() => setCollapsed((c) => !c)} onContextMenu={(e) => openMenu(e, null)}>
          <Icon name={collapsed ? 'chevronRight' : 'chevronDown'} size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{basename(root)}</span>
        </button>
        <div className="kb-view-actions" style={{ paddingRight: 6 }}>
          <button className="kb-icon-btn" style={{ width: 22, height: 22 }} title="New File..." onClick={() => startCreate('file')}><Icon name="newFile" size={15} /></button>
          <button className="kb-icon-btn" style={{ width: 22, height: 22 }} title="New Folder..." onClick={() => startCreate('folder')}><Icon name="newFolder" size={15} /></button>
          <button className="kb-icon-btn" style={{ width: 22, height: 22 }} title="Refresh Explorer" onClick={wb.refreshTree}><Icon name="refresh" size={15} /></button>
          <button
            className="kb-icon-btn"
            style={{ width: 22, height: 22 }}
            title="Collapse Folders in Explorer"
            onClick={() => Array.from(wb.expanded).forEach((d) => wb.toggleDir(d, false))}
          >
            <Icon name="collapse" size={15} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div
          className="kb-scroll"
          tabIndex={0}
          onFocus={() => setFocusRow(true)}
          onBlur={() => setFocusRow(false)}
          onKeyDown={onKey}
          onContextMenu={(e) => openMenu(e, null)}
          style={{ outline: 'none' }}
        >
          {renderDir(root, 0)}
          {(wb.dirs[root] || []).length === 0 && !creating && <div className="kb-empty">This folder is empty.</div>}
        </div>
      )}
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  );
};
