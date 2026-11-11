/** Thin typed access to the Electron preload API (`window.kernelBase`). */
export interface DirEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
}

export const kb: any = (typeof window !== 'undefined' && (window as any).kernelBase) || null;
export const isDesktop = !!kb;

const ok = (r: any) => r && r.success !== false;

export const fsApi = {
  async read(path: string): Promise<string> {
    const r = await kb.fs.readFile(path);
    if (!ok(r)) throw new Error(r?.error || 'Cannot read file');
    return typeof r === 'string' ? r : r.content;
  },
  async write(path: string, content: string) {
    const r = await kb.fs.writeFile(path, content);
    if (!ok(r)) throw new Error(r?.error || 'Cannot write file');
  },
  async list(dir: string): Promise<DirEntry[]> {
    const r = await kb.fs.listDirectory(dir, 1);
    if (!ok(r)) throw new Error(r?.error || 'Cannot list folder');
    return (r.nodes || []).map((n: any) => ({ name: n.name, path: n.path, isDirectory: n.isDirectory, size: n.size }));
  },
  async stat(path: string) {
    const r = await kb.fs.stat(path);
    return ok(r) ? r.stat : null;
  },
  async mkdir(path: string) {
    const r = await kb.fs.createDirectory(path);
    if (!ok(r)) throw new Error(r?.error);
  },
  async create(path: string) {
    const r = await kb.fs.createFile(path, '');
    if (!ok(r)) throw new Error(r?.error);
  },
  async rename(from: string, to: string) {
    const r = await kb.fs.renamePath(from, to);
    if (!ok(r)) throw new Error(r?.error);
  },
  async trash(path: string) {
    const r = await kb.fs.trash(path);
    if (!ok(r)) throw new Error(r?.error);
  },
  reveal: (path: string) => kb.fs.revealInFinder(path),
};

export const basename = (p: string) => p.replace(/\/+$/, '').split('/').pop() || p;
export const dirname = (p: string) => p.replace(/\/+$/, '').split('/').slice(0, -1).join('/') || '/';
export const joinPath = (a: string, b: string) => `${a.replace(/\/+$/, '')}/${b}`;
export const relPath = (root: string | undefined, p: string) =>
  root && p.startsWith(root + '/') ? p.slice(root.length + 1) : p;

export function languageOf(path: string): string {
  const name = basename(path).toLowerCase();
  if (name === 'dockerfile') return 'dockerfile';
  if (name === 'makefile') return 'makefile';
  const ext = name.includes('.') ? name.split('.').pop()! : '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    json: 'json', jsonc: 'json', md: 'markdown', markdown: 'markdown',
    py: 'python', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
    java: 'java', kt: 'kotlin', go: 'go', rs: 'rust', swift: 'swift', rb: 'ruby', php: 'php',
    cs: 'csharp', html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
    xml: 'xml', svg: 'xml', yml: 'yaml', yaml: 'yaml', sh: 'shell', bash: 'shell', zsh: 'shell',
    sql: 'sql', toml: 'ini', ini: 'ini', lua: 'lua', r: 'r', dart: 'dart', scala: 'scala',
  };
  return map[ext] || 'plaintext';
}

export const LANGUAGE_LABEL: Record<string, string> = {
  typescript: 'TypeScript', javascript: 'JavaScript', json: 'JSON', markdown: 'Markdown', python: 'Python',
  c: 'C', cpp: 'C++', java: 'Java', kotlin: 'Kotlin', go: 'Go', rust: 'Rust', swift: 'Swift', ruby: 'Ruby',
  php: 'PHP', csharp: 'C#', html: 'HTML', css: 'CSS', scss: 'SCSS', less: 'Less', xml: 'XML', yaml: 'YAML',
  shell: 'Shell Script', sql: 'SQL', ini: 'Ini', lua: 'Lua', r: 'R', dart: 'Dart', scala: 'Scala',
  dockerfile: 'Dockerfile', makefile: 'Makefile', plaintext: 'Plain Text',
};

export const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'icns']);
