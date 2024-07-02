// src/components/AudioCall.js

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = '963c1a3084614e2cb469fbc72df183f9';
const TOKEN_SERVER_URL = 'http://127.0.0.1:8000/token';

const AudioCall = ({ channelName, sessionId, onTokenGenerated, onJoinChannel, onLeaveChannel }) => {
  const client = useRef(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState('');

  const cleanup = useCallback(async () => {
    try {
      if (localTrack) {
        localTrack.close();
        console.log('Closed local audio track.');
      }
      if (client.current) {
        await client.current.leave();
        console.log('Left the channel.');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, [localTrack]); 

  useEffect(() => {
    client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    console.log('AgoraRTC client created.');

    return () => {
      cleanup();
    };
  }, [cleanup]);

  const generateToken = useCallback(async () => {
    try {
      const response = await fetch(TOKEN_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelName, userName: sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      console.log('Token received:', data.token);
      onTokenGenerated(data.token); 
    } catch (error) {
      console.error('Error generating token:', error);
      throw error; 
    }
  }, [channelName, sessionId, onTokenGenerated]);

  const joinChannel = useCallback(async () => {
    try {
      if (client.current.connectionState === 'DISCONNECTING') {
        console.log('Client is disconnecting, please wait...');
        return;
      }

      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.error('No token found. Generate a token first.');
        await generateToken();
      }

      await client.current.join(APP_ID, channelName, storedToken, sessionId);
      console.log('Joined the channel:', channelName, 'with userName:', sessionId);

      const track = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalTrack(track);

      const publishTrack = async () => {
        if (client.current.connectionState === 'CONNECTED') {
          await client.current.publish(track);
          console.log('Published local audio track.');
          setJoined(true);
          onJoinChannel(); 
        } else {
          console.log('Waiting for connection to stabilize...');
          setTimeout(publishTrack, 1000);
        }
      };
      publishTrack();

      client.current.on('token-privilege-will-expire', async () => {
        console.log('Token privilege will expire soon. Fetching a new token...');
        await generateToken();
        await client.current.renewToken(token);
        console.log('Token renewed.');
      });

      client.current.on('token-privilege-did-expire', async () => {
        console.log('Token privilege has expired. Rejoining the channel...');
        await generateToken();
        await client.current.leave();
        await client.current.join(APP_ID, channelName, token, sessionId);
        await publishTrack();
        console.log('Rejoined the channel with new token.');
      });

    } catch (error) {
      console.error('Error joining the channel:', error);
    }
  }, [channelName, generateToken, sessionId, token, onJoinChannel]);

  const leaveChannel = useCallback(async () => {
    try {
      await cleanup();
      setJoined(false);
      onLeaveChannel(); 
    } catch (error) {
      console.error('Error leaving the channel:', error);
    }
  }, [cleanup, onLeaveChannel]);

  useEffect(() => {
    if (!client.current) return;

    client.current.on('user-published', async (user, mediaType) => {
      console.log('User published:', user.uid);
      try {
        await client.current.subscribe(user, mediaType);
        console.log('Subscribed to user:', user.uid);

        if (mediaType === 'audio') {
          const audioTrack = user.audioTrack;
          audioTrack.play();
          setRemoteUsers((prevUsers) => [...prevUsers, user]);
          console.log('Playing audio track for user:', user.uid);
        }
      } catch (error) {
        console.error('Error subscribing to user:', error);
      }
    });

    client.current.on('user-unpublished', (user) => {
      console.log('User unpublished:', user.uid);
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    });

    return () => {
      client.current.off('user-published');
      client.current.off('user-unpublished');
    };
  }, []);

  return (
    <div>
      <h3>Channel: {channelName}</h3>
      <h4>User Name: {sessionId}</h4>
      <div>
        <h4>Remote Users</h4>
        {remoteUsers.map((user) => (
          <div key={user.uid}>User ID: {user.uid}</div>
        ))}
      </div>
      <p>{joined ? 'Successfully connected to the channel.' : (token ? 'Token generated. Ready to join the channel.' : 'Generate a token to join the channel.')}</p>
    </div>
  );
};

export default AudioCall;
