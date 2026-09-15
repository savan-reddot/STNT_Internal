import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGORA_CONFIG } from '../utils/agoraConfig';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';
import agoraService from '../utils/agoraService';

const getBaseUrl = () => {
  return __DEV__ ? 'https://staging.stntinternational.com/api' : 'https://staging.stntinternational.com/api';
};

const getAuthHeaders = async () => {
  try {
    const token = (await AsyncStorage.getItem('@token')) || (await AsyncStorage.getItem('webtoken'));
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
  channel?: string;
  matchUserId?: string;
  type?: string;
  callerName?: string;
}

export interface AcceptCallParams {
  signal?: AbortSignal;
  channel?: string;
  type?: string;
  callerName?: string;
}

export interface CallApiOptions {
  signal?: AbortSignal;
  channel?: string;
  status?: string;
}

export const initiateCall = async ({
  signal,
  channel = '',
  matchUserId = '',
  type = 'agora_video',
  callerName = 'Traveler User',
}: InitiateCallParams = {}) => {
  try {
    let serverToken: string | null = null;
    const headers = await getAuthHeaders();

    try {
      const response = await axios.post(
        `${getBaseUrl()}/agora/callInitiated`,
        {
          channelName: channel,
          type,
          matchUserId,
          callerName,
        },
        { headers, signal }
      );

      if (response?.data?.token || response?.data?.rtcToken) {
        serverToken = response.data.token || response.data.rtcToken;
      }
    } catch (apiError: any) {
      console.error('[initiateCall] Server notification warning:', apiError?.message);
      if (apiError?.response?.data?.message) {
        showErrorToast(apiError.response.data.message);
      }
    }

    let token = serverToken;
    if (!token) {
      token = await generateToken(channel);
    }

    return {
      success: true,
      channelName: channel,
      token,
      type,
      callerName,
    };
  } catch (error: any) {
    console.error('[initiateCall] Failed to initiate call:', error);
    throw error;
  }
};

export const acceptCall = async ({
  signal,
  channel,
  type = 'agora_video',
  callerName = 'Unknown',
}: AcceptCallParams = {}) => {
  try {
    let result: any = null;
    const headers = await getAuthHeaders();

    try {
      result = await axios.post(
        `${getBaseUrl()}/agora/accept`,
        {
          channelName: channel,
          channel: channel,
          type,
          startTime: new Date().toISOString(),
        },
        { headers, signal }
      );
    } catch (apiError: any) {
      console.error('[acceptCall] Failed to notify server:', apiError?.message);
    }

    const token = result?.data?.data?.rtc_token || result?.data?.token;
    return {
      success: true,
      channelName: channel,
      token,
      type,
      callerName,
    };
  } catch (error) {
    console.error('[acceptCall] Failed to accept call:', error);
    throw error;
  }
};

export const rejectCall = async ({ signal, channel }: CallApiOptions = {}) => {
  try {
    const headers = await getAuthHeaders();
    try {
      await axios.post(`${getBaseUrl()}/agora/reject`, { channelName: channel }, { headers, signal });
    } catch (apiError: any) {
      console.error('[rejectCall] Failed to notify server:', apiError?.message);
    }
    return { success: true };
  } catch (error) {
    console.error('[rejectCall] Failed to reject call:', error);
    throw error;
  }
};

export const disconnectCall = async ({ signal, channel }: CallApiOptions = {}) => {
  try {
    await agoraService.leaveChannel();
    const headers = await getAuthHeaders();

    try {
      await axios.post(
        `${getBaseUrl()}/agora/end`,
        { channelName: channel, endTime: new Date().toISOString() },
        { headers, signal }
      );
    } catch (apiError: any) {
      console.error('[disconnectCall] Failed to notify server:', apiError?.message);
    }

    return { success: true };
  } catch (error) {
    console.error('[disconnectCall] Failed to disconnect call:', error);
    throw error;
  }
};

export const updateUserCallStatus = async ({ signal, channel, status }: CallApiOptions = {}) => {
  try {
    const headers = await getAuthHeaders();
    try {
      await axios.post(
        `${getBaseUrl()}/agora/change-status`,
        { channelName: channel, status },
        { headers, signal }
      );
    } catch (apiError: any) {
      console.error('[updateUserCallStatus] Failed to notify server:', apiError?.message);
    }
    return { success: true };
  } catch (error) {
    console.error('[updateUserCallStatus] Failed to update user call status:', error);
    throw error;
  }
};

export const generateToken = async (channelName: string): Promise<string | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${getBaseUrl()}/agora/token`,
      {
        channelName,
        uid: 0,
      },
      { headers }
    );
    return response.data?.data?.token || response.data?.token || null;
  } catch (error) {
    console.error('[generateToken] Failed to generate token:', error);
    return null;
  }
};

const agoraApi = {
  initiateCall,
  acceptCall,
  rejectCall,
  disconnectCall,
  updateUserCallStatus,
  generateToken,
};

export default agoraApi;
