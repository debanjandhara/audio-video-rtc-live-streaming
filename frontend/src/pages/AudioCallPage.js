import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const TOKEN_SERVER_URL = process.env.REACT_APP_TOKEN_SERVER_URL;


const AudioCallPage = () => {
  const rtc = useRef({
    localAudioTrack: null,
    client: null,
  }).current;
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState([]);
  const [token, setToken] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [userId, setUserId] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const sessionId = localStorage.getItem('session_id') || uuidv4();
  if (!localStorage.getItem('session_id')) {
    localStorage.setItem('session_id', sessionId);
  }

  rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

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
      console.log('CODE CONSOLE LOG : Token received:', data.token);
    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error generating token:', error);
    }
  }, [channelName, sessionId]);

  const joinChannel = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.error('CODE CONSOLE ERROR : No token found. Generate a token first.');
        await generateToken();
      }

      await rtc.client.join(APP_ID, channelName, storedToken, sessionId);
      console.log('CODE CONSOLE LOG : Joined the channel:', channelName, 'with userName:', sessionId);
      rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await rtc.client.publish([rtc.localAudioTrack]);

      setJoined(true);
      setIsPublished(true);

      rtc.client.on('token-privilege-will-expire', async () => {
        console.log('CODE CONSOLE LOG : Token privilege will expire soon. Fetching a new token...');
        await generateToken();
        await rtc.client.renewToken(token);
        console.log('CODE CONSOLE LOG : Token renewed.');
      });

      rtc.client.on('token-privilege-did-expire', async () => {
        console.log('CODE CONSOLE LOG : Token privilege has expired. Rejoining the channel...');
        await generateToken();
        await rtc.client.unpublish([rtc.localAudioTrack]);
        rtc.localAudioTrack.close();
        await rtc.client.leave();
        await rtc.client.join(APP_ID, channelName, token, sessionId);
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await rtc.client.publish([rtc.localAudioTrack]);
        setJoined(true);
        setIsPublished(true);
        console.log('CODE CONSOLE LOG : Rejoined the channel with new token.');
      });

      rtc.client.on('user-published', async (user, mediaType) => {
        console.log('CODE CONSOLE LOG : User published:', user.uid);
        try {
          if (mediaType === 'audio') {
            await rtc.client.subscribe(user, mediaType);
            setRemoteUsers((prevUsers) => [...prevUsers, user]);
            console.log('CODE CONSOLE LOG : Subscribed to user:', user.uid);
          }
        } catch (error) {
          console.error('CODE CONSOLE ERROR : Error subscribing to user:', error);
        }
      });

      rtc.client.on('user-unpublished', (user) => {
        console.log('CODE CONSOLE LOG : User unpublished:', user.uid);
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      });

    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error joining the channel:', error);
    }
  }, [channelName, generateToken, sessionId, token]);

  const leaveChannel = useCallback(async () => {
    try {
      if (rtc.localAudioTrack) {
        await rtc.client.unpublish([rtc.localAudioTrack]);
        rtc.localAudioTrack.close();
      }
      setJoined(false);
      setIsPublished(false);
      await rtc.client.leave();
      console.log('CODE CONSOLE LOG : Left Channel');
    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error leaving the channel:', error);
    }
  }, [rtc.localAudioTrack]);

  const toggleMute = useCallback(async () => {
    if (rtc.localAudioTrack) {
      try {
        const newMutedState = !isMuted;
        await rtc.localAudioTrack.setEnabled(!newMutedState);
        setIsMuted(newMutedState);
        console.log(newMutedState ? 'Muted local audio track.' : 'Unmuted local audio track.');
      } catch (error) {
        console.error('CODE CONSOLE ERROR : Error toggling mute:', error);
      }
    }
  }, [isMuted, rtc.localAudioTrack]);

  const publishTrack = useCallback(async () => {
    try {
      if (!rtc.localAudioTrack) {
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      }
      await rtc.client.publish([rtc.localAudioTrack]);
      console.log('CODE CONSOLE LOG : Published local audio track.');
      setIsPublished(true);
    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error publishing track:', error);
    }
  }, []);

  const unpublishTrack = useCallback(async () => {
    try {
      if (rtc.localAudioTrack) {
        await rtc.client.unpublish([rtc.localAudioTrack]);
        rtc.localAudioTrack.close();
        setIsPublished(false);
        console.log('CODE CONSOLE LOG : Unpublished local audio track.');
      }
    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error unpublishing track:', error);
    }
  }, []);

  const subscribeToUser = useCallback(async () => {
    if (!joined) {
      console.error('CODE CONSOLE ERROR : Cannot subscribe to user, not joined.');
      return;
    }

    try {
      const user = remoteUsers.find((u) => u.uid === userId);
      if (user) {
        await rtc.client.subscribe(user, 'audio');
        console.log('CODE CONSOLE LOG : Subscribed to user:', user.uid);
      } else {
        console.error('CODE CONSOLE ERROR : User not found:', userId);
      }
    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error subscribing to user:', error);
    }
  }, [remoteUsers, userId, joined]);

  const unsubscribeFromUser = useCallback(async () => {
    try {
      const user = remoteUsers.find((u) => u.uid === userId);
      if (user) {
        await rtc.client.unsubscribe(user, 'audio');
        console.log('CODE CONSOLE LOG : Unsubscribed from user:', user.uid);
      } else {
        console.error('CODE CONSOLE ERROR : User not found:', userId);
      }
    } catch (error) {
      console.error('CODE CONSOLE ERROR : Error unsubscribing from user:', error);
    }
  }, [remoteUsers, userId]);

  return (
    <div>
      <h2>Agora Audio Call</h2>
      <div>
        <label>
          Channel Name:
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </label>
        <button onClick={generateToken}>Generate Token</button>
        <button onClick={joinChannel} disabled={joined}>Join Channel</button>
        <button onClick={leaveChannel} disabled={!joined}>Leave Channel</button>
        <button onClick={toggleMute} disabled={!joined}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        {joined && (
          <div>
            <button onClick={publishTrack} disabled={isPublished}>Publish Track</button>
            <button onClick={unpublishTrack} disabled={!isPublished}>Unpublish Track</button>
          </div>
        )}
        <div>
          <label>
            User ID:
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>
          <button onClick={subscribeToUser}>Subscribe to User</button>
          <button onClick={unsubscribeFromUser}>Unsubscribe from User</button>
        </div>
      </div>
      {joined ? (
        <div>
          <h3>Channel: {channelName}</h3>
          <h4>User Name: {sessionId}</h4>
          <div>
            <h4>Remote Users</h4>
            {remoteUsers.length > 0 ? (
              remoteUsers.map((user) => (
                <div key={user.uid}>User ID: {user.uid}</div>
              ))
            ) : (
              <p>No remote users connected.</p>
            )}
          </div>
          <p>Successfully connected to the channel.</p>
        </div>
      ) : (
        <p>{token ? 'Token generated. Ready to join the channel.' : 'Generate a token to join the channel.'}</p>
      )}
    </div>
  );
};

export default AudioCallPage;
