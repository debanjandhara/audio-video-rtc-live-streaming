import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import AgoraRTC from 'agora-rtc-sdk-ng';


const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const BACKEND_SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL;



const AgoraAudioCallFunctions = () => {

  const navigate = useNavigate();

  const rtc = useRef({
    localAudioTrack: null,
    client: null,
  }).current;

  const [remoteUsers, setRemoteUsers] = useState(new Set());
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [token, setToken] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [userId, setUserId] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Multiple Instance of Agora Prevention - Solved Joining Problem
  if (!rtc.client) {
    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    console.log('Agora Client Initialised');
    AgoraRTC.enableLogUpload();
    AgoraRTC.setLogLevel(0);
  }

  // Make this generateToken() control API Calling and Response from : frontend\src\utils\api.js
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

  // Join Channel + Publish Audio :
  const joinChannel = useCallback(async (channelName, sessionId) => {
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

      console.log('Audio Published in the channel');

      setJoined(true);
      setIsPublished(true);

      // Add current session ID to remoteUsers - Remote Users Views Doesn't Work as intended - Check dev_logs_DO_NOT_DELETE\Read this for devs.txt : Line : 19
      setRemoteUsers((prevUsers) => {
        const updatedUsers = new Set(prevUsers);
        updatedUsers.add(sessionId);
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

            // Remote Users Views Doesn't Work as intended - Check dev_logs_DO_NOT_DELETE\Read this for devs.txt : Line : 19
            setRemoteUsers((prevUsers) => {
              const updatedUsers = new Set(prevUsers);
              updatedUsers.add(user.uid);
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

        // Remote Users Views Doesn't Work as intended - Check dev_logs_DO_NOT_DELETE\Read this for devs.txt : Line : 19
        setRemoteUsers((prevUsers) => {
          const updatedUsers = new Set(prevUsers);
          updatedUsers.delete(user.uid);
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

      // Remove current session ID from remoteUsers - Doesn't Work as intended - Check dev_logs_DO_NOT_DELETE\Read this for devs.txt : Line : 19
      setRemoteUsers((prevUsers) => {
        const updatedUsers = new Set(prevUsers);
        updatedUsers.delete(sessionId);
        return updatedUsers;
      });

      console.log('Left Channel');
      navigate('/');

    } catch (error) {
      console.error('Error leaving the channel:', error);
    }
  }, [rtc.client, rtc.localAudioTrack, sessionId]);

  // Function to mute the audio after joining, to be added after Users Joining... Just to AutoMute them !! - Need To Implement
  const muteAfterJoining = useCallback(async () => {
    if (rtc.localAudioTrack) {
      try {
        await rtc.localAudioTrack.setMuted(true);
        setIsMuted(true);
        console.log('Muted local audio track after joining.');
      } catch (error) {
        console.error('Error muting audio after joining:', error);
      }
    }
  }, [rtc.localAudioTrack]);

  // Use the muteAfterJoining() for first time, after joining... then Toggle mute using toggleMute()
  const toggleMute = useCallback(async () => {
    if (rtc.localAudioTrack) {
      try {
        const newMutedState = !isMuted;
        await rtc.localAudioTrack.setMuted(newMutedState);
        setIsMuted(newMutedState);
        console.log(newMutedState ? 'Muted local audio track.' : 'Unmuted local audio track.');
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  }, [isMuted, rtc.localAudioTrack]);

  // Debug Purposes - Sample Functions for Publish Control - Not Needed Anymore
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

  // Debug Purposes - Sample Functions for UnPublish Control - Not Needed Anymore
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

  // Debug Purposes - For Manually Subscribing to Unique User By UserID - Not Needed Anymore
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

  // Debug Purposes - For Manually UnSubscribing to Unique User By UserID - Not Needed Anymore
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

  // Exporting All Functions
  return {
    rtc,
    remoteUsers: Array.from(remoteUsers),
    joined,
    channelName,
    setChannelName,
    token,
    setToken,
    isMuted,
    setIsMuted,
    userId,
    setUserId,
    isPublished,
    sessionId,
    setSessionId,
    generateToken,
    joinChannel,
    leaveChannel,
    muteAfterJoining,
    toggleMute,
    publishTrack,
    unpublishTrack,
    subscribeToUser,
    unsubscribeFromUser,
  };
};

export default AgoraAudioCallFunctions;
