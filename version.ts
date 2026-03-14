import { version } from './package.json';

/**
 * SDK version info
 * Used for X-SMH-SDK-Version header identification
 */

export const SDK_VERSION = version;

export const SDK_NAME = 'smh-js-sdk';

// Generate X-SMH-SDK-Version header value
export const getUserAgent = (): string => {
  return `${SDK_NAME}/${SDK_VERSION}`;
};
