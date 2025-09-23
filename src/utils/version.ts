import packageJson from '../../package.json';

export const getVersion = () => {
  return packageJson.version === '0.0.0' ? '1.0.0' : packageJson.version;
};

export const getFormattedVersion = () => {
  return `v${getVersion()}`;
};