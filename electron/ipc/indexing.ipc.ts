import { ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

interface SearchResultItem {
  filePath: string;
  relativePath: string;
  line: number;
  column: number;
  preview: string;
  match: string;
}

export function registerIndexingIPC() {
  ipcMain.handle(
    'indexing:search',
    async (
      _,
      workspacePath: string,
      query: string,
      options?: { caseSensitive?: boolean; wholeWord?: boolean; maxResults?: number }
    ) => {
      if (!query || query.trim().length === 0) {
        return { success: true, results: [] };
      }

      const results: SearchResultItem[] = [];
      const maxResults = options?.maxResults || 200;
      const flags = options?.caseSensitive ? 'g' : 'gi';
      const regexPattern = options?.wholeWord ? `\\b${query}\\b` : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(regexPattern, flags);

      const searchInDir = async (dir: string): Promise<void> => {
        if (results.length >= maxResults) return;
        const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);

        for (const entry of entries) {
          if (results.length >= maxResults) break;
          if (
            entry.name === '.git' ||
            entry.name === 'node_modules' ||
            entry.name === '.DS_Store' ||
            entry.name === 'dist' ||
            entry.name.endsWith('.png') ||
            entry.name.endsWith('.icns') ||
            entry.name.endsWith('.dmg')
          ) {
            continue;
          }

          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await searchInDir(fullPath);
          } else {
            try {
              const stat = await fs.promises.stat(fullPath);
              if (stat.size > 2 * 1024 * 1024) continue; // Skip huge files

              const content = await fs.promises.readFile(fullPath, 'utf-8');
              const lines = content.split('\n');

              for (let i = 0; i < lines.length; i++) {
                if (results.length >= maxResults) break;
                const line = lines[i];
                searchRegex.lastIndex = 0;
                let match = searchRegex.exec(line);

                while (match && results.length < maxResults) {
                  results.push({
                    filePath: fullPath,
                    relativePath: path.relative(workspacePath, fullPath),
                    line: i + 1,
                    column: match.index + 1,
                    preview: line.trim(),
                    match: match[0],
                  });
                  if (!flags.includes('g')) break;
                  match = searchRegex.exec(line);
                }
              }
            } catch {
              // Binary file or read error
            }
          }
        }
      };

      await searchInDir(workspacePath);
      return { success: true, results };
    }
  );

  ipcMain.handle('indexing:quickOpen', async (_, workspacePath: string, query: string) => {
    const matchedFiles: { name: string; relativePath: string; fullPath: string }[] = [];
    const normalizedQuery = query.toLowerCase();

    const walk = async (dir: string) => {
      if (matchedFiles.length >= 50) return;
      const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);

      for (const entry of entries) {
        if (matchedFiles.length >= 50) break;
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;

        const fullPath = path.join(dir, entry.name);
        const rel = path.relative(workspacePath, fullPath);

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          if (!query || rel.toLowerCase().includes(normalizedQuery) || entry.name.toLowerCase().includes(normalizedQuery)) {
            matchedFiles.push({
              name: entry.name,
              relativePath: rel,
              fullPath,
            });
          }
        }
      }
    };

    await walk(workspacePath);
    return { success: true, files: matchedFiles };
  });

  ipcMain.handle('indexing:index', async (_, workspacePath: string) => {
    return { success: true, indexedCount: 0 };
  });
}
