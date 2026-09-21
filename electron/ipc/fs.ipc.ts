import { ipcMain, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

export function registerFsIPC() {
  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:createFile', async (_, filePath: string, content = '') => {
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:createDirectory', async (_, dirPath: string) => {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:deletePath', async (_, targetPath: string) => {
    try {
      const stat = await fs.promises.stat(targetPath);
      if (stat.isDirectory()) {
        await fs.promises.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(targetPath);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:renamePath', async (_, oldPath: string, newPath: string) => {
    try {
      await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
      await fs.promises.rename(oldPath, newPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:listDirectory', async (_, dirPath: string, maxDepth = 4) => {
    try {
      const readDirRecursive = async (currentDir: string, currentDepth: number): Promise<any[]> => {
        if (currentDepth > maxDepth) return [];
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        const results: any[] = [];

        for (const entry of entries) {
          if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.DS_Store' || entry.name === 'dist') {
            continue;
          }
          const fullPath = path.join(currentDir, entry.name);
          const isDirectory = entry.isDirectory();

          if (isDirectory) {
            const children = await readDirRecursive(fullPath, currentDepth + 1);
            results.push({
              name: entry.name,
              path: fullPath,
              relativePath: path.relative(dirPath, fullPath),
              isDirectory: true,
              children,
            });
          } else {
            const stat = await fs.promises.stat(fullPath).catch(() => null);
            results.push({
              name: entry.name,
              path: fullPath,
              relativePath: path.relative(dirPath, fullPath),
              isDirectory: false,
              size: stat ? stat.size : 0,
              modifiedAt: stat ? stat.mtimeMs : Date.now(),
            });
          }
        }

        // Sort: directories first, then alphabetically
        return results.sort((a, b) => {
          if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
          }
          return a.isDirectory ? -1 : 1;
        });
      };

      const nodes = await readDirRecursive(dirPath, 1);
      return { success: true, nodes };
    } catch (err: any) {
      return { success: false, error: err.message, nodes: [] };
    }
  });

  ipcMain.handle('fs:stat', async (_, targetPath: string) => {
    try {
      const stat = await fs.promises.stat(targetPath);
      return {
        success: true,
        stat: {
          size: stat.size,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          modifiedAt: stat.mtimeMs,
          createdAt: stat.birthtimeMs,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:revealInFinder', async (_, targetPath: string) => {
    try {
      shell.showItemInFolder(targetPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
