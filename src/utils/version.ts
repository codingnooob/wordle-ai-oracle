import packageJson from '../../package.json';

interface GitInfo {
  hash: string;
  shortHash: string;
  branch: string;
  date: string;
  isDirty: boolean;
  buildMode: string;
  buildTime: string;
}

export const getGitInfo = (): GitInfo => {
  return {
    hash: import.meta.env.VITE_GIT_HASH || '',
    shortHash: import.meta.env.VITE_GIT_SHORT_HASH || '',
    branch: import.meta.env.VITE_GIT_BRANCH || '',
    date: import.meta.env.VITE_GIT_DATE || '',
    isDirty: import.meta.env.VITE_GIT_DIRTY === 'true',
    buildMode: import.meta.env.VITE_BUILD_MODE || 'unknown',
    buildTime: import.meta.env.VITE_BUILD_TIME || ''
  };
};

export const getBaseVersion = () => {
  return packageJson.version === '0.0.0' ? '1.0.0' : packageJson.version;
};

export const getVersion = () => {
  const baseVersion = getBaseVersion();
  const gitInfo = getGitInfo();
  
  // Return base version if no Git info available
  if (!gitInfo.shortHash) {
    return baseVersion;
  }
  
  const isDev = gitInfo.buildMode === 'development';
  const isMain = gitInfo.branch === 'main' || gitInfo.branch === 'master';
  
  // Format: v1.0.0-dev-a1b2c3d (development)
  // Format: v1.0.0-a1b2c3d (production main)
  // Format: v1.0.0-feature-a1b2c3d (production branch)
  
  let versionSuffix = '';
  
  if (isDev) {
    versionSuffix = `-dev-${gitInfo.shortHash}`;
  } else if (isMain) {
    versionSuffix = `-${gitInfo.shortHash}`;
  } else {
    // Clean branch name for version string
    const cleanBranch = gitInfo.branch.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 10);
    versionSuffix = `-${cleanBranch}-${gitInfo.shortHash}`;
  }
  
  if (gitInfo.isDirty) {
    versionSuffix += '-dirty';
  }
  
  return `${baseVersion}${versionSuffix}`;
};

export const getFormattedVersion = () => {
  return `v${getVersion()}`;
};