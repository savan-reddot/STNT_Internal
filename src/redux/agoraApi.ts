import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showErrorToast } from '../utils/toastUtils';
import agoraService from '../utils/agoraService';

const getBaseUrl = () =>
  __DEV__
    ? 'https://staging.stntinternational.com/api'
    : 'https://api.stntinternational.com/api';

const getAuthHeaders = async (tokenOverride?: string) => {
  try {
    const token =
      tokenOverride ||
      (await AsyncStorage.getItem('@token')) ||
      (await AsyncStorage.getItem('webtoken'));

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        Accept: '*/*',
        'Content-Type': 'application/json',
      };
    }
  } catch (err) {
    console.error('[agoraApi] Error fetching auth token:', err);
  }
  return {
    Accept: '*/*',
    'Content-Type': 'application/json',
  };
};

export interface InitiateCallParams {
  signal?: AbortSignal;
  /** channelName: 1-63 chars, pattern ^[A-Za-z0-9_.:-]{1,63}$ */
  channel?: string;
  /** ID of the other traveller user */
  matchUserId?: number | string;
  /** 'agora_video' | 'agora_audio' */
  type?: 'agora_video' | 'agora_audio';
}

export interface AcceptCallParams {
  signal?: AbortSignal;
  channel?: string;
  type?: 'agora_video' | 'agora_audio';
}

export interface CallApiOptions {
  signal?: AbortSignal;
  channel?: string;
  status?: string;
}

export interface RegisterDeviceParams {
  fcmToken: string;
  deviceType: 'android' | 'ios';
  deviceId?: string;
}

export interface GenerateTokenParams {
  channelName: string;
  uid?: number;
  role?: 'publisher' | 'subscriber';
}

// ---------------------------------------------------------------------------
// 1. POST /agora/register-device
// Call after login so the backend can ring this device via FCM.
// ---------------------------------------------------------------------------
export const registerDevice = async ({
  fcmToken,
  deviceType,
  deviceId,
}: RegisterDeviceParams) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${getBaseUrl()}/agora/register-device`,
      { fcmToken, deviceType, ...(deviceId ? { deviceId } : {}) },
      { headers },
    );
    console.log('registerDevice response==>>', response?.data);
    return response.data;
  } catch (error: any) {
    console.error('[registerDevice] Failed:', error?.message);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 1b. POST /agora/unregister-device
// Call on logout with the same fcmToken.
// ---------------------------------------------------------------------------
export const unregisterDevice = async (fcmToken: string, token?: string) => {
  try {
    const headers = await getAuthHeaders(token);
    const response = await axios.post(
      `${getBaseUrl()}/agora/unregister-device`,
      { fcmToken },
      { headers },
    );
    console.log('unregisterDevice response==>>', response?.data);
    return response?.data;
  } catch (error: any) {
    console.log('[unregisterDevice] Failed:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 2. POST /agora/callInitiated
// Caller starts a call. Returns the RTC token so the caller can join.
// 409 if either user is already on a call.
// ---------------------------------------------------------------------------
export const initiateCall = async ({
  signal,
  channel = '',
  matchUserId,
  type = 'agora_video',
}: InitiateCallParams = {}) => {
  try {
    const headers = await getAuthHeaders();
    let serverToken: string | null = null;
    let notificationSent = true;

    try {
      const response = await axios.post(
        `${getBaseUrl()}/agora/callInitiated`,
        {
          channelName: channel,
          type,
          matchUserId,
        },
        { headers, signal },
      );

      const data = response.data?.data;
      serverToken = data?.rtc_token ?? data?.token ?? null;
      notificationSent = data?.notification_sent ?? true;

      if (notificationSent === false) {
        showErrorToast('User unavailable – no registered device.');
      }
    } catch (apiError: any) {
      console.error('[initiateCall] Server error:', apiError?.message);
      const msg = apiError?.response?.data?.message;
      if (msg) {
        showErrorToast(msg);
      }
      // Re-throw so callers can distinguish 409 busy from network errors.
      throw apiError;
    }

    // Fallback: generate a fresh token if the server didn't return one.
    const token =
      serverToken ?? (await generateToken({ channelName: channel }));

    return {
      success: true,
      channelName: channel,
      token,
      type,
      notificationSent,
    };
  } catch (error: any) {
    console.error('[initiateCall] Failed to initiate call:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 3. POST /agora/accept
// Receiver accepts. Returns the RTC token for that side to join.
// 409 if ring expired (60 s) or already ended.
// ---------------------------------------------------------------------------
export const acceptCall = async ({
  signal,
  channel,
  type = 'agora_video',
}: AcceptCallParams = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${getBaseUrl()}/agora/accept`,
      { channelName: channel, type },
      { headers, signal },
    );

    const data = response.data?.data;
    const token = data?.rtc_token ?? data?.token ?? null;

    return { success: true, channelName: channel, token, type };
  } catch (error: any) {
    console.error('[acceptCall] Failed to accept call:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 4. POST /agora/reject
// Either side, while ringing.
// ---------------------------------------------------------------------------
export const rejectCall = async ({ signal, channel }: CallApiOptions = {}) => {
  try {
    const headers = await getAuthHeaders();
    await axios.post(
      `${getBaseUrl()}/agora/reject`,
      { channelName: channel },
      { headers, signal },
    );
    return { success: true };
  } catch (error: any) {
    console.error('[rejectCall] Failed to reject call:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 5. POST /agora/end
// Either side, any state. Safe to call twice.
// ---------------------------------------------------------------------------
export const disconnectCall = async ({
  signal,
  channel,
}: CallApiOptions = {}) => {
  try {
    // Leave the Agora channel locally first so media stops immediately.
    await agoraService.leaveChannel();

    const headers = await getAuthHeaders();
    try {
      const response = await axios.post(
        `${getBaseUrl()}/agora/end`,
        { channelName: channel },
        { headers, signal },
      );
      return { success: true, data: response.data?.data };
    } catch (apiError: any) {
      console.error(
        '[disconnectCall] Server notification failed:',
        apiError?.message,
      );
      // Even if the server call fails we consider the local side disconnected.
      return { success: true };
    }
  } catch (error: any) {
    console.error('[disconnectCall] Failed to disconnect call:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 6. POST /agora/change-status
// Call once the local user has joined the Agora channel.
// ---------------------------------------------------------------------------
export const updateUserCallStatus = async ({
  signal,
  channel,
}: CallApiOptions = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${getBaseUrl()}/agora/change-status`,
      { channelName: channel },
      { headers, signal },
    );
    return { success: true, data: response.data?.data };
  } catch (error: any) {
    console.error(
      '[updateUserCallStatus] Failed to update call status:',
      error,
    );
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 7. POST /agora/token
// Fresh RTC token for an existing call (e.g. on reconnect).
// uid defaults to 0 (wildcard), role defaults to 'publisher'.
// ---------------------------------------------------------------------------
export const generateToken = async ({
  channelName,
  uid = 0,
  role = 'publisher',
}: GenerateTokenParams): Promise<string | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${getBaseUrl()}/agora/token`,
      { channelName, uid, role },
      { headers },
    );
    return response.data?.data?.token ?? response.data?.token ?? null;
  } catch (error: any) {
    console.error('[generateToken] Failed to generate token:', error);
    return null;
  }
};

// ---------------------------------------------------------------------------
// 8. POST /agora/rtm-token
// RTM (signalling) token bound to the logged-in user id. No request body.
// ---------------------------------------------------------------------------
export const getRtmToken = async (): Promise<string | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${getBaseUrl()}/agora/rtm-token`,
      {},
      { headers },
    );
    return response.data?.data?.token ?? null;
  } catch (error: any) {
    console.error('[getRtmToken] Failed to get RTM token:', error);
    return null;
  }
};

// ---------------------------------------------------------------------------
// 9. GET /agora/history?limit=20
// The user's recent calls, newest first. limit 1-100.
// ---------------------------------------------------------------------------
export const getCallHistory = async (limit: number = 20) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${getBaseUrl()}/agora/history`, {
      headers,
      params: { limit },
    });
    return response.data?.data ?? [];
  } catch (error: any) {
    console.error('[getCallHistory] Failed to fetch call history:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 10. GET /agora/config
// App-level config needed to initialise the Agora SDK.
// ---------------------------------------------------------------------------
export const getAgoraConfig = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${getBaseUrl()}/agora/config`, {
      headers,
    });
    return response.data?.data ?? null;
  } catch (error: any) {
    console.error('[getAgoraConfig] Failed to fetch Agora config:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Default export – named map for convenience
// ---------------------------------------------------------------------------
const agoraApi = {
  registerDevice,
  unregisterDevice,
  initiateCall,
  acceptCall,
  rejectCall,
  disconnectCall,
  updateUserCallStatus,
  generateToken,
  getRtmToken,
  getCallHistory,
  getAgoraConfig,
};

export default agoraApi;
