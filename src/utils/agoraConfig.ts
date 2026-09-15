// Agora Configuration & Constants

export const AGORA_CONFIG = {
  // Default Agora App ID from Connections app reference
  APP_ID: '7a8b8f2e37304fc18700376a902c817f',

  // Token server URL (optional)
  TOKEN_SERVER_URL: null,

  // Default channel name prefix
  DEFAULT_CHANNEL: 'stnt_channel',

  // Video encoder settings
  VIDEO_SETTINGS: {
    width: 640,
    height: 480,
    frameRate: 15,
    bitrate: 400,
  },

  // Audio settings
  AUDIO_SETTINGS: {
    sampleRate: 48000,
    channels: 1,
    mode: 'communication',
  },

  // Call timeout (in ms)
  CALL_TIMEOUT: 30000,

  // Retry settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const AGORA_CONNECTION_STATES = {
  DISCONNECTED: 1,
  CONNECTING: 2,
  CONNECTED: 3,
  RECONNECTING: 4,
  FAILED: 5,
};

export const AGORA_USER_STATES = {
  OFFLINE: 0,
  ONLINE: 1,
  JOINING: 2,
  LEAVING: 3,
};

export const NOTIFICATION_TYPE = {
  AGORA_VIDEO: 'agora_video',
  AGORA_AUDIO: 'agora_audio',
  CALL_ACCEPTED: 'agora_call_accepted',
  CALL_REJECTED: 'agora_call_rejected',
  CALL_DISCONNECTED: 'agora_call_disconnected',
};

export const CALL_STATUS = {
  CALL_INITIATED: 'CALL_INITIATED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  DISCONNECTED: 'DISCONNECTED',
};

export default AGORA_CONFIG;
