import { execSync } from 'child_process';
import type { Plugin } from 'vite';

interface GitInfo {
  hash: string;
  shortHash: string;
  branch: string;
  date: string;
  isDirty: boolean;
}

function getGitInfo(): GitInfo | null {
  try {
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const date = execSync('git log -1 --format=%cd --date=iso', { encoding: 'utf8' }).trim();
    
    // Check if working directory is dirty
    let isDirty = false;
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
      isDirty = status.length > 0;
    } catch {
      // Ignore errors for dirty check
    }

    return {
      hash,
      shortHash,
      branch,
      date,
      isDirty
    };
  } catch (error) {
    console.warn('Git information not available:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export function gitInfoPlugin(): Plugin {
  return {
    name: 'git-info',
    config(config, { mode }) {
      const gitInfo = getGitInfo();
      
      if (!config.define) {
        config.define = {};
      }

      // Define environment variables that will be available in the app
      config.define['import.meta.env.VITE_GIT_HASH'] = JSON.stringify(gitInfo?.hash || '');
      config.define['import.meta.env.VITE_GIT_SHORT_HASH'] = JSON.stringify(gitInfo?.shortHash || '');
      config.define['import.meta.env.VITE_GIT_BRANCH'] = JSON.stringify(gitInfo?.branch || '');
      config.define['import.meta.env.VITE_GIT_DATE'] = JSON.stringify(gitInfo?.date || '');
      config.define['import.meta.env.VITE_GIT_DIRTY'] = JSON.stringify(gitInfo?.isDirty || false);
      config.define['import.meta.env.VITE_BUILD_MODE'] = JSON.stringify(mode);
      config.define['import.meta.env.VITE_BUILD_TIME'] = JSON.stringify(new Date().toISOString());
    }
  };
}