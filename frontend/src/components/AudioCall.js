// import { useEffect, useRef, useState, useCallback } from 'react';
import { useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const BACKEND_SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL;

const AudioCall = () => {
  const rtc = useRef({
    localAudioTrack: null,
    client: null,
  }).current;
  const [remoteUsers, setRemoteUsers] = useState(new Set());
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [token, setToken] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [userId, setUserId] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const sessionId = localStorage.getItem('session_id') || uuidv4();
  if (!localStorage.getItem('session_id')) {
    localStorage.setItem('session_id', sessionId);
  }

  if (!rtc.client) {
    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    console.log('Agora Client Initialised');
    AgoraRTC.enableLogUpload();
    AgoraRTC.setLogLevel(0);
  }

  const generateToken = useCallback(async () => {
    console.log(`${BACKEND_SERVER_URL}/token`)
    try {
      const response = await fetch(`${BACKEND_SERVER_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelName: channelName, userName: sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      console.log('Token received:', data.token);
    } catch (error) {
      console.error('Error generating token:', error);
    }
  }, [channelName, sessionId]);

  const joinChannel = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.error('No token found. Generate a token first.');
        await generateToken();
      }

      await rtc.client.join(APP_ID, channelName, storedToken, sessionId);
      console.log('Joined the channel:', channelName, 'with userName:', sessionId);
      rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await rtc.client.publish([rtc.localAudioTrack]);

      setJoined(true);
      setIsPublished(true);

      // Add current session ID to remoteUsers
      setRemoteUsers((prevUsers) => {
        const updatedUsers = new Set(prevUsers);
        updatedUsers.add(sessionId);
        console.log("Updated remoteUsers after join --> ", Array.from(updatedUsers));
        return updatedUsers;
      });

      rtc.client.on('token-privilege-will-expire', async () => {
        console.log('Token privilege will expire soon. Fetching a new token...');
        await generateToken();
        await rtc.client.renewToken(token);
        console.log('Token renewed.');
      });

      rtc.client.on('token-privilege-did-expire', async () => {
        console.log('Token privilege has expired. Rejoining the channel...');
        await generateToken();
        await rtc.client.unpublish([rtc.localAudioTrack]);
        rtc.localAudioTrack.close();
        await rtc.client.leave();
        await rtc.client.join(APP_ID, channelName, token, sessionId);
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await rtc.client.publish([rtc.localAudioTrack]);
        setJoined(true);
        setIsPublished(true);
        console.log('Rejoined the channel with new token.');
      });

      rtc.client.on('user-published', async (user, mediaType) => {
        await rtc.client.subscribe(user, mediaType);
        console.log('User published:', user.uid);
        try {
          if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
            setRemoteUsers((prevUsers) => {
              const updatedUsers = new Set(prevUsers);
              updatedUsers.add(user.uid);
              console.log("Updated remoteUsers after user-published --> ", Array.from(updatedUsers));
              return updatedUsers;
            });
            console.log('Subscribed to user:', user.uid);
          }
        } catch (error) {
          console.error('Error subscribing to user:', error);
        }
      });

      rtc.client.on('user-unpublished', async (user) => {
        await rtc.client.unsubscribe(user);
        console.log('User unpublished:', user.uid);
        setRemoteUsers((prevUsers) => {
          const updatedUsers = new Set(prevUsers);
          updatedUsers.delete(user.uid);
          console.log("Updated remoteUsers after user-unpublished --> ", Array.from(updatedUsers));
          return updatedUsers;
        });
      });

    } catch (error) {
      console.error('Error joining the channel:', error);
    }
  }, [rtc, channelName, generateToken, sessionId, token]);

  const leaveChannel = useCallback(async () => {
    try {
      if (rtc.localAudioTrack) {
        await rtc.client.unpublish([rtc.localAudioTrack]);
        rtc.localAudioTrack.close();
      }
      setJoined(false);
      setIsPublished(false);
      await rtc.client.leave();

      // Remove current session ID from remoteUsers
      setRemoteUsers((prevUsers) => {
        const updatedUsers = new Set(prevUsers);
        updatedUsers.delete(sessionId);
        console.log("Updated remoteUsers after leave --> ", Array.from(updatedUsers));
        return updatedUsers;
      });

      console.log('Left Channel');
    } catch (error) {
      console.error('Error leaving the channel:', error);
    }
  }, [rtc.client, rtc.localAudioTrack, sessionId]);

  const toggleMute = useCallback(async () => {
    if (rtc.localAudioTrack) {
      try {
        const newMutedState = !isMuted;
        await rtc.localAudioTrack.setEnabled(!newMutedState);
        setIsMuted(newMutedState);
        console.log(newMutedState ? 'Muted local audio track.' : 'Unmuted local audio track.');
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  }, [isMuted, rtc.localAudioTrack]);

  const publishTrack = useCallback(async () => {
    try {
      rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await rtc.client.publish([rtc.localAudioTrack]);
      console.log('Published local audio track.');
      setIsPublished(true);
    } catch (error) {
      console.error('Error publishing track:', error);
    }
  }, [rtc]);

  const unpublishTrack = useCallback(async () => {
    try {
      if (rtc.localAudioTrack) {
        await rtc.client.unpublish([rtc.localAudioTrack]);
        rtc.localAudioTrack.close();
        setIsPublished(false);
        console.log('Unpublished local audio track.');
      }
    } catch (error) {
      console.error('Error unpublishing track:', error);
    }
  }, [rtc.client, rtc.localAudioTrack]);

  const subscribeToUser = useCallback(async () => {
    if (!joined) {
      console.error('Cannot subscribe to user, not joined.');
      return;
    }

    try {
      const user = Array.from(remoteUsers).find((uid) => uid === userId);
      if (user) {
        await rtc.client.subscribe(user, 'audio');
        console.log('Subscribed to user:', user);
      } else {
        console.error('User not found:', userId);
      }
    } catch (error) {
      console.error('Error subscribing to user:', error);
    }
  }, [joined, remoteUsers, rtc.client, userId]);

  const unsubscribeFromUser = useCallback(async () => {
    try {
      const user = Array.from(remoteUsers).find((uid) => uid === userId);
      if (user) {
        await rtc.client.unsubscribe(user, 'audio');
        console.log('Unsubscribed from user:', user);
      } else {
        console.error('User not found:', userId);
      }
    } catch (error) {
      console.error('Error unsubscribing from user:', error);
    }
  }, [remoteUsers, rtc.client, userId]);

  return {
    rtc,
    remoteUsers: Array.from(remoteUsers),
    joined,
    channelName,
    setChannelName,
    token,
    isMuted,
    userId,
    setUserId,
    isPublished,
    sessionId,
    generateToken,
    joinChannel,
    leaveChannel,
    toggleMute,
    publishTrack,
    unpublishTrack,
    subscribeToUser,
    unsubscribeFromUser,
  };
};

export default AudioCall;
