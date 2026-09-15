import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  AudioProfileType,
  AudioScenarioType,
} from 'react-native-agora';
import { AGORA_CONFIG, AGORA_CONNECTION_STATES } from './agoraConfig';

export interface RemoteUserInfo {
  uid: number;
  joined: boolean;
}

export interface AgoraCallbacks {
  onJoinChannelSuccess?: (channel: string, uid: number, elapsed: number) => void;
  onLeaveChannel?: (stats: any) => void;
  onUserJoined?: (uid: number, elapsed: number) => void;
  onUserOffline?: (uid: number, reason: number) => void;
  onError?: (err: any) => void;
  onConnectionStateChanged?: (state: any, reason: any) => void;
}

class AgoraService {
  private engine: IRtcEngine | null = null;
  public isInitialized: boolean = false;
  public isJoined: boolean = false;
  public currentChannel: string | null = null;
  public currentUid: number | null = null;
  public remoteUsers: Map<number, RemoteUserInfo> = new Map();
  public localVideoEnabled: boolean = true;
  public localAudioEnabled: boolean = true;
  public isMuted: boolean = false;
  public isSpeakerEnabled: boolean = true;
  private callbacks: AgoraCallbacks = {};

  async initialize(appId: string = AGORA_CONFIG.APP_ID): Promise<boolean> {
    try {
      if (this.isInitialized && this.engine) {
        return true;
      }

      if (!appId || appId.length === 0) {
        throw new Error('Invalid Agora App ID');
      }

      this.engine = createAgoraRtcEngine();
      if (!this.engine) {
        throw new Error('Failed to create Agora RTC engine');
      }

      const result = this.engine.initialize({ appId });
      if (result !== 0) {
        console.error('Agora initialization failed with error code:', result);
        throw new Error(`Failed to initialize Agora RTC engine: ${result}`);
      }

      this.setupEventListeners();
      await this.configureAudioVideo();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Agora RTC engine:', error);
      this.handleError(error);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.engine) return;

    this.engine.registerEventHandler({
      onJoinChannelSuccess: (_connection: any, elapsed: number) => {
        this.isJoined = true;
        this.currentChannel = _connection.channelId || null;
        this.currentUid = _connection.localUid || null;
        this.callbacks.onJoinChannelSuccess?.(
          _connection.channelId || '',
          _connection.localUid || 0,
          elapsed
        );
      },
      onLeaveChannel: (_connection: any, stats: any) => {
        this.isJoined = false;
        this.currentChannel = null;
        this.currentUid = null;
        this.remoteUsers.clear();
        this.callbacks.onLeaveChannel?.(stats);
      },
      onUserJoined: (_connection: any, uid: number, elapsed: number) => {
        this.remoteUsers.set(uid, { uid, joined: true });
        this.callbacks.onUserJoined?.(uid, elapsed);
      },
      onUserOffline: (_connection: any, uid: number, reason: number) => {
        this.remoteUsers.delete(uid);
        this.callbacks.onUserOffline?.(uid, reason);
      },
      onError: (err: any, msg: string) => {
        console.error('Agora engine error:', err, msg);
        if (err === 110) return;
        this.handleError({ code: err, message: msg });
      },
      onConnectionStateChanged: (_connection: any, state: any, reason: any) => {
        this.callbacks.onConnectionStateChanged?.(state, reason);
      },
    });
  }

  private async configureAudioVideo(): Promise<void> {
    if (!this.engine) return;

    try {
      await this.engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      await this.engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      await this.engine.enableVideo();
      await this.engine.enableAudio();

      await this.engine.setVideoEncoderConfiguration({
        dimensions: {
          width: AGORA_CONFIG.VIDEO_SETTINGS.width,
          height: AGORA_CONFIG.VIDEO_SETTINGS.height,
        },
        frameRate: AGORA_CONFIG.VIDEO_SETTINGS.frameRate,
        bitrate: AGORA_CONFIG.VIDEO_SETTINGS.bitrate,
        orientationMode: 0,
        degradationPreference: 0,
      });

      await this.engine.setAudioProfile(
        AudioProfileType.AudioProfileDefault,
        AudioScenarioType.AudioScenarioDefault
      );
      await this.engine.enableAudioVolumeIndication(1000, 3, true);
    } catch (error) {
      console.error('Failed to configure audio/video:', error);
      throw error;
    }
  }

  async joinChannel(channelName: string, token: string | null = null, uid: number = 0): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.engine) {
        console.error('Agora not initialized, initializing now...');
        const initSuccess = await this.initialize();
        if (!initSuccess || !this.engine) {
          throw new Error('Agora not initialized');
        }
      }

      if (this.isJoined) {
        return true;
      }

      const uniqueUid = uid === 0 ? Math.floor(Math.random() * 1000000) : uid;
      const result = this.engine.joinChannel(token || '', channelName, uniqueUid, {
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });

      if (result === 0) {
        this.engine.enableLocalVideo(true);
        this.engine.enableLocalAudio(true);
        return true;
      } else {
        console.error('❌ Failed to join channel with error code:', result);
        throw new Error(`Failed to join channel: ${result}`);
      }
    } catch (error) {
      console.error('❌ Failed to join channel:', error);
      this.handleError(error);
      return false;
    }
  }

  async leaveChannel(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.isJoined || !this.engine) {
        return true;
      }

      const result = this.engine.leaveChannel();
      if (result === 0) {
        this.isJoined = false;
        this.currentChannel = null;
        this.currentUid = null;
        this.remoteUsers.clear();
        return true;
      } else {
        throw new Error(`Failed to leave channel: ${result}`);
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
      this.handleError(error);
      return false;
    }
  }

  async enableLocalVideo(enabled: boolean): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.engine) throw new Error('Agora not initialized');
      const result = this.engine.enableLocalVideo(enabled);
      if (result === 0) {
        this.localVideoEnabled = enabled;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle local video:', error);
      return false;
    }
  }

  async muteLocalAudio(muted: boolean): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.engine) throw new Error('Agora not initialized');
      const result = this.engine.muteLocalAudioStream(muted);
      if (result === 0) {
        this.isMuted = muted;
        this.localAudioEnabled = !muted;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mute/unmute local audio:', error);
      return false;
    }
  }

  async switchCamera(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.engine) throw new Error('Agora not initialized');
      const result = this.engine.switchCamera();
      return result === 0;
    } catch (error) {
      console.error('Failed to switch camera:', error);
      return false;
    }
  }

  async setEnableSpeakerphone(enabled: boolean): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.engine) throw new Error('Agora not initialized');
      const result = this.engine.setEnableSpeakerphone(enabled);
      if (result === 0) {
        this.isSpeakerEnabled = enabled;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
      return false;
    }
  }

  getConnectionState(): number {
    return this.isJoined ? AGORA_CONNECTION_STATES.CONNECTED : AGORA_CONNECTION_STATES.DISCONNECTED;
  }

  setCallbacks(callbacks: AgoraCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private handleError(error: any): void {
    console.error('Agora error handler:', error);
    this.callbacks.onError?.(error);
  }

  async destroy(): Promise<boolean> {
    try {
      if (this.isJoined) {
        await this.leaveChannel();
      }

      if (this.engine) {
        this.engine.release();
        this.engine = null;
      }

      this.isInitialized = false;
      this.isJoined = false;
      this.currentChannel = null;
      this.currentUid = null;
      this.remoteUsers.clear();
      this.callbacks = {};

      return true;
    } catch (error) {
      console.error('Failed to destroy Agora RTC engine:', error);
      return false;
    }
  }
}

const agoraService = new AgoraService();
export default agoraService;
