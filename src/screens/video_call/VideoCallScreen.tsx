import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Vibration,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcSurfaceView,
  RtcConnection,
  VideoSourceType,
  RenderModeType,
  VideoMirrorModeType,
} from 'react-native-agora';
import messaging from '@react-native-firebase/messaging';
import { AGORA_CONFIG, NOTIFICATION_TYPE } from '../../utils/agoraConfig';
import { acceptCall, rejectCall, disconnectCall, updateUserCallStatus } from '../../redux/agoraApi';
import { requestVideoCallPermissions } from '../../utils/permissions';

const localUid = 0;

export interface VideoCallRouteParams {
  channel?: string;
  channelName?: string;
  token?: string | null;
  rtcToken?: string | null;
  matchUserId?: string;
  name?: string;
  callerName?: string;
  avatar?: string;
  type?: string;
  isIncoming?: boolean;
}

const VideoCallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const params = (route.params as VideoCallRouteParams) || {};
  const {
    channel: routeChannel,
    channelName: routeChannelName,
    token: routeToken,
    rtcToken: routeRtcToken,
    name: routeName,
    callerName: routeCallerName,
    type = NOTIFICATION_TYPE.AGORA_VIDEO,
    isIncoming = false,
  } = params;

  const channelName = routeChannel || routeChannelName || AGORA_CONFIG.DEFAULT_CHANNEL;
  const token = routeRtcToken || routeToken || null;
  const callerDisplayName = routeCallerName || routeName || 'ST&T Support Staff';
  const appId = AGORA_CONFIG.APP_ID;

  const agoraEngineRef = useRef<IRtcEngine | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [videoKey, setVideoKey] = useState(0);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCallRejected, setIsCallRejected] = useState(false);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [isPreviewStarted, setIsPreviewStarted] = useState(false);
  const [hasNavigatedAway, setHasNavigatedAway] = useState(false);
  
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    setupVideoSDKEngine();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const data = remoteMessage?.data;
      if (
        (data?.type === NOTIFICATION_TYPE.CALL_REJECTED || data?.type === NOTIFICATION_TYPE.CALL_DISCONNECTED) &&
        (data?.channelName === channelName || data?.channel === channelName)
      ) {
        if (hasNavigatedAway) return;
        setHasNavigatedAway(true);
        stopCallTimer();
        stopVibration();

        try {
          await agoraEngineRef.current?.stopPreview();
          await agoraEngineRef.current?.leaveChannel();
          setRemoteUid(0);
          setIsJoined(false);
        } catch (error) {
          console.error('[VideoCallScreen] Error leaving channel:', error);
        }

        setTimeout(() => {
          if (navigation.canGoBack()) navigation.goBack();
        }, 500);
      }
    });

    return () => {
      unsubscribe();
      stopCallTimer();
      stopVibration();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      agoraEngineRef.current?.leaveChannel();
      agoraEngineRef.current?.release();
    };
  }, [channelName]);

  // Preview & Auto-join management
  useEffect(() => {
    if (isIncoming && isSDKInitialized && agoraEngineRef.current && !isPreviewStarted && !isCallAccepted && !isCallRejected) {
      const startPreviewTimer = setTimeout(async () => {
        try {
          await agoraEngineRef.current?.startPreview();
          setIsPreviewStarted(true);
        } catch (error) {
          console.error('[VideoCallScreen] Failed to start preview for incoming call:', error);
        }
      }, 300);

      return () => clearTimeout(startPreviewTimer);
    }
  }, [isIncoming, isSDKInitialized, isPreviewStarted, isCallAccepted, isCallRejected]);

  useEffect(() => {
    if (!isIncoming && isSDKInitialized && agoraEngineRef.current && !isPreviewStarted && !isCallRejected) {
      const autoStartTimer = setTimeout(async () => {
        try {
          await agoraEngineRef.current?.startPreview();
          setIsPreviewStarted(true);

          await agoraEngineRef.current?.joinChannel(token || '', channelName, localUid, {
            channelProfile: ChannelProfileType.ChannelProfileCommunication,
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            publishMicrophoneTrack: true,
            publishCameraTrack: true,
            autoSubscribeAudio: true,
            autoSubscribeVideo: true,
          });
        } catch (error) {
          console.error('[VideoCallScreen] Auto-join failed:', error);
          Alert.alert('Connection Failed', 'Failed to join the video call. Please try again.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      }, 300);

      return () => clearTimeout(autoStartTimer);
    }
  }, [isIncoming, isSDKInitialized, isPreviewStarted, isCallRejected, token, channelName]);

  const setupVideoSDKEngine = async () => {
    try {
      const hasPermission = await requestVideoCallPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera and Microphone permissions are required for video calls.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;

      await agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      agoraEngine.enableVideo();
      agoraEngine.enableAudio();

      if (Platform.OS === 'ios') {
        agoraEngine.setDefaultAudioRouteToSpeakerphone(true);
      }

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: async (_connection: RtcConnection, _elapsed: number) => {
          setIsJoined(true);
          setIsPreviewStarted(true);

          try {
            if (isIncoming && isCallAccepted) {
              await updateUserCallStatus({
                signal: abortControllerRef.current?.signal,
                channel: channelName,
                status: 'connected',
              });
            } else if (!isIncoming) {
              await updateUserCallStatus({
                signal: abortControllerRef.current?.signal,
                channel: channelName,
                status: 'joined',
              });
            }
          } catch (error) {
            console.error('[VideoCallScreen] Failed to update call status:', error);
          }
        },
        onUserJoined: async (_connection: RtcConnection, uid: number, _elapsed: number) => {
          setRemoteUid(uid);
          setVideoKey((prev) => prev + 1);

          if (callDuration === 0) {
            startCallTimer();
          }

          try {
            await updateUserCallStatus({
              signal: abortControllerRef.current?.signal,
              channel: channelName,
              status: 'active',
            });
          } catch (error) {
            console.error('[VideoCallScreen] Failed to update call status on user joined:', error);
          }

          try {
            if (agoraEngineRef.current) {
              agoraEngineRef.current.muteRemoteVideoStream(uid, false);
              agoraEngineRef.current.muteRemoteAudioStream(uid, false);
              agoraEngineRef.current.setRemoteRenderMode(
                uid,
                RenderModeType.RenderModeFit,
                VideoMirrorModeType.VideoMirrorModeDisabled
              );

              setTimeout(() => setVideoKey((prev) => prev + 1), 200);
            }
          } catch (error) {
            console.error('[VideoCallScreen] Failed to setup remote stream:', error);
          }
        },
        onUserOffline: async (_connection: RtcConnection, _uid: number, _reason: number) => {
          if (hasNavigatedAway) return;
          stopCallTimer();

          try {
            if (agoraEngineRef.current) {
              await agoraEngineRef.current.stopPreview();
              await agoraEngineRef.current.leaveChannel();
              setRemoteUid(0);
              setIsJoined(false);
            }
          } catch (error) {
            console.error('[VideoCallScreen] Error on user offline:', error);
          }

          setHasNavigatedAway(true);
          setTimeout(() => {
            if (navigation.canGoBack()) navigation.goBack();
          }, 500);
        },
        onError: (err: number, msg: string) => {
          console.error('[VideoCallScreen] Agora Engine Error:', err, msg);
        },
      });

      setIsSDKInitialized(true);
    } catch (e) {
      console.error('[VideoCallScreen] SDK initialization failed:', e);
      setIsSDKInitialized(false);
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setCallDuration(0);
  };

  const startVibration = () => {
    Vibration.vibrate([500, 500, 500, 500], true);
  };

  const stopVibration = () => {
    Vibration.cancel();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const joinCall = async () => {
    if (isJoined || isCallRejected) return;

    try {
      stopVibration();

      if (isIncoming && !isCallAccepted) {
        setIsCallAccepted(true);
        await agoraEngineRef.current?.startPreview();
        setIsPreviewStarted(true);

        const result = await acceptCall({
          signal: abortControllerRef.current?.signal,
          channel: channelName,
          type,
          callerName: callerDisplayName,
        });

        const callToken = routeRtcToken || result.token || token;

        await agoraEngineRef.current?.joinChannel(callToken || '', channelName, localUid, {
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
      } else {
        await agoraEngineRef.current?.startPreview();
        await agoraEngineRef.current?.joinChannel(token || '', channelName, localUid, {
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
      }
    } catch (e) {
      console.error('[VideoCallScreen] Join channel failed:', e);
      Alert.alert('Connection Failed', 'Failed to join the call. Please try again.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const toggleLocalVideo = async () => {
    try {
      if (!agoraEngineRef.current) return;
      if (!isJoined && !isPreviewStarted) return;

      const newState = !localVideoEnabled;
      agoraEngineRef.current.enableLocalVideo(newState);
      agoraEngineRef.current.muteLocalVideoStream(!newState);
      setLocalVideoEnabled(newState);
    } catch (error) {
      console.error('[VideoCallScreen] Failed to toggle local video:', error);
    }
  };

  const toggleMute = async () => {
    try {
      if (!agoraEngineRef.current) return;
      if (!isJoined && !isPreviewStarted) return;

      const newMutedState = !isMuted;
      agoraEngineRef.current.muteLocalAudioStream(newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('[VideoCallScreen] Failed to toggle mute:', error);
    }
  };

  const switchCamera = async () => {
    try {
      if (!agoraEngineRef.current) return;
      if (!isJoined && !isPreviewStarted) return;

      agoraEngineRef.current.switchCamera();
    } catch (error) {
      console.error('[VideoCallScreen] Failed to switch camera:', error);
    }
  };

  const handleRejectCall = async () => {
    try {
      setIsCallRejected(true);
      stopVibration();
      await rejectCall({
        signal: abortControllerRef.current?.signal,
        channel: channelName,
      });
      navigation.goBack();
    } catch (error) {
      console.error('[VideoCallScreen] Failed to reject call:', error);
      navigation.goBack();
    }
  };

  const endCall = async () => {
    if (hasNavigatedAway) return;
    setHasNavigatedAway(true);

    try {
      stopCallTimer();
      await disconnectCall({
        signal: abortControllerRef.current?.signal,
        channel: channelName,
      });
      await agoraEngineRef.current?.stopPreview();
      await agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);

      setTimeout(() => {
        if (navigation.canGoBack()) navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('[VideoCallScreen] Failed to end call:', error);
      if (navigation.canGoBack()) navigation.goBack();
    }
  };

  useEffect(() => {
    if (isIncoming && !isCallAccepted && !isJoined && isSDKInitialized) {
      startVibration();
    }
    return () => {
      stopVibration();
    };
  }, [isIncoming, isCallAccepted, isJoined, isSDKInitialized]);

  // Render Incoming Call Screen
  if (isIncoming && !isCallAccepted && !isJoined) {
    return (
      <SafeAreaView style={styles.incomingCallContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

        {isPreviewStarted && (
          <View style={styles.incomingCallVideoPreview}>
            {localVideoEnabled ? (
              <RtcSurfaceView
                canvas={{
                  uid: localUid,
                  sourceType: VideoSourceType.VideoSourceCamera,
                }}
                style={styles.incomingCallVideoFullScreen}
                zOrderMediaOverlay={true}
              />
            ) : (
              <View style={styles.incomingCallVideoPlaceholder}>
                <Icon name="account" size={100} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        <View style={styles.incomingCallOverlay}>
          <View style={styles.incomingCallTopInfo}>
            <View style={styles.avatarContainer}>
              <Icon name="account-tie" size={60} color="#3BA66B" />
            </View>
            <Text style={styles.incomingCallName}>{callerDisplayName}</Text>
            <Text style={styles.incomingCallLabel}>Incoming Video Call Support</Text>
          </View>

          <View style={styles.incomingCallBottomButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton, isCallRejected && styles.buttonDisabled]}
              onPress={handleRejectCall}
              disabled={isCallRejected}
            >
              <Icon name="phone-hangup" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton, isCallRejected && styles.buttonDisabled]}
              onPress={joinCall}
              disabled={isCallRejected}
            >
              <Icon name="phone" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Active / Connecting Video Call View
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {remoteUid !== 0 ? (
        <>
          <View style={styles.remoteVideoContainer}>
            <View key={`remote-wrap-${remoteUid}-${videoKey}`} style={styles.remoteVideoWrapper}>
              <RtcSurfaceView
                key={`remote-${remoteUid}-${videoKey}`}
                canvas={{
                  uid: remoteUid,
                  sourceType: VideoSourceType.VideoSourceRemote,
                }}
                style={styles.remoteVideo}
                zOrderMediaOverlay={false}
              />
            </View>
          </View>

          {(isPreviewStarted || isJoined) && (
            <View style={styles.localVideoWrapper}>
              {localVideoEnabled ? (
                <RtcSurfaceView
                  canvas={{
                    uid: localUid,
                    sourceType: VideoSourceType.VideoSourceCamera,
                  }}
                  style={styles.localVideo}
                  zOrderMediaOverlay={true}
                />
              ) : (
                <View style={styles.localVideoPlaceholder}>
                  <Icon name="account" size={36} color="#FFFFFF" />
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <>
          {(isPreviewStarted || isJoined) && (
            <View style={styles.localVideoFullScreen}>
              {localVideoEnabled ? (
                <RtcSurfaceView
                  canvas={{
                    uid: localUid,
                    sourceType: VideoSourceType.VideoSourceCamera,
                  }}
                  style={styles.localVideoFullScreenView}
                  zOrderMediaOverlay={true}
                />
              ) : (
                <View style={styles.localVideoPlaceholderFullScreen}>
                  <Icon name="account" size={90} color="#FFFFFF" />
                </View>
              )}
            </View>
          )}
        </>
      )}

      {/* Top Header Overlay */}
      <View style={styles.callInfoContainer}>
        <Text style={styles.callerName}>
          {remoteUid !== 0 ? callerDisplayName : isIncoming ? callerDisplayName : `Calling ${callerDisplayName}...`}
        </Text>
        {callDuration > 0 ? (
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        ) : (
          <Text style={styles.connectionStatus}>
            {remoteUid !== 0 ? 'Connected' : isJoined ? 'Waiting for staff...' : 'Connecting...'}
          </Text>
        )}
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Icon name={isMuted ? 'microphone-off' : 'microphone'} size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !localVideoEnabled && styles.controlButtonActive]}
            onPress={toggleLocalVideo}
          >
            <Icon name={localVideoEnabled ? 'camera' : 'camera-off'} size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
            <Icon name="camera-flip" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={endCall}>
            <Icon name="phone-hangup" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  incomingCallContainer: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  incomingCallVideoPreview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  incomingCallVideoFullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  incomingCallVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C2541',
  },
  incomingCallOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(11, 19, 43, 0.75)',
  },
  incomingCallTopInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EAFBF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  incomingCallName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  incomingCallLabel: {
    fontSize: 16,
    color: '#3BA66B',
    fontWeight: '600',
  },
  incomingCallBottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  rejectButton: {
    backgroundColor: '#E63946',
  },
  acceptButton: {
    backgroundColor: '#3BA66B',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  remoteVideoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  localVideoWrapper: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 110,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3BA66B',
    elevation: 8,
    zIndex: 10,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#1C2541',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoFullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  localVideoFullScreenView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  localVideoPlaceholderFullScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callInfoContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 140,
    zIndex: 10,
  },
  callerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  callDuration: {
    fontSize: 16,
    color: '#3BA66B',
    fontWeight: '600',
    marginTop: 4,
  },
  connectionStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#E63946',
  },
  endCallButton: {
    backgroundColor: '#E63946',
  },
});
