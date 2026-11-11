import React, { useEffect, useState } from 'react';
import { basename } from './bridge';
import { Icon, BrandLogo } from './icons';

/**
 * Workspace trust: the user decides ONCE per folder how much the agents may do there.
 *  - auto   agents may edit files and run commands (npm install, builds, tests) without asking again
 *  - edits  agents may edit files; commands are not run
 * The choice is remembered per folder on this Mac and can be reset from the Agent Studio.
 */
export type TrustLevel = 'auto' | 'edits';
const KEY = 'kb.trust.v1';

function readAll(): Record<string, TrustLevel> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function getTrust(folder: string): TrustLevel | null {
  return folder ? readAll()[folder] || null : null;
}

export function setTrust(folder: string, level: TrustLevel | null) {
  const all = readAll();
  if (level) all[folder] = level;
  else delete all[folder];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable: the prompt will show again next time */
  }
  window.dispatchEvent(new CustomEvent('kb:trust-changed', { detail: { folder, level } }));
}

/** agy permission mode for a trust level */
export const modeFor = (level: TrustLevel | null): 'auto' | 'accept-edits' => (level === 'auto' ? 'auto' : 'accept-edits');

let pending: { folder: string; resolve: (l: TrustLevel | null) => void }[] = [];

/** Returns the folder's trust level, asking the user once if it has not been decided yet. */
export function ensureTrust(folder: string): Promise<TrustLevel | null> {
  const known = getTrust(folder);
  if (known || !folder) return Promise.resolve(known);
  return new Promise((resolve) => {
    pending.push({ folder, resolve });
    window.dispatchEvent(new CustomEvent('kb:trust-request', { detail: { folder } }));
  });
}

/** Modal rendered once by the workbench. */
export const TrustPrompt: React.FC = () => {
  const [folder, setFolder] = useState('');
  useEffect(() => {
    const h = (e: Event) => setFolder((e as CustomEvent).detail.folder);
    window.addEventListener('kb:trust-request', h);
    return () => window.removeEventListener('kb:trust-request', h);
  }, []);
  if (!folder) return null;
  const answer = (level: TrustLevel | null) => {
    if (level) setTrust(folder, level);
    const waiting = pending.filter((p) => p.folder === folder);
    pending = pending.filter((p) => p.folder !== folder);
    waiting.forEach((p) => p.resolve(level));
    setFolder('');
  };
  return (
    <div className="kb-modal-backdrop" data-testid="trust-prompt">
      <div className="kb-modal" role="dialog" aria-modal="true" aria-labelledby="kb-trust-title">
        <div className="kb-modal-head">
          <BrandLogo size={22} />
          <span id="kb-trust-title">Let agents work in “{basename(folder)}”?</span>
        </div>
        <p>
          Kernel and the Agent Studio agents will create and change files in <span className="mono">{folder}</span>. Choose once; you will not be asked again for this
          folder.
        </p>
        <div className="kb-modal-actions">
          <button className="kb-btn" onClick={() => answer('auto')} data-testid="trust-auto" autoFocus>
            Allow edits and commands
          </button>
          <button className="kb-btn secondary" onClick={() => answer('edits')} data-testid="trust-edits">
            Edits only
          </button>
          <button className="kb-btn secondary" onClick={() => answer(null)}>
            Not now
          </button>
        </div>
        <p className="kb-muted" style={{ fontSize: 11.5, marginBottom: 0 }}>
          “Edits and commands” also lets agents install packages and run builds or tests. Reset it any time in Agent Studio.
        </p>
      </div>
    </div>
  );
};
