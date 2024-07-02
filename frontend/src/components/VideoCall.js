// src/components/VideoCall.js
import React, { useEffect, useRef } from 'react';
import { agoraClient, agoraConfig } from '../utils/agora';

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    agoraClient.on('user-published', async (user, mediaType) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event
      await agoraClient.subscribe(user, mediaType);
      console.log('subscribe success');

      if (mediaType === 'video') {
        // Play the remote video track
        user.videoTrack.play(remoteVideoRef.current);
      }
    });

    agoraClient.on('user-unpublished', async (user) => {
      // Unsubscribe from the tracks of the remote user
      await agoraClient.unsubscribe(user);
    });

    agoraClient.on('user-left', async (user) => {
      // Handle user leaving the channel
    });

    agoraClient.on('error', (err) => {
      console.log('Agora error:', err);
      // Handle error
    });

    return () => {
      agoraClient.leave(); // Leave channel when component unmounts
    };
  }, []);

  const joinChannel = async () => {
    try {
      await agoraClient.join(agoraConfig.appId, agoraConfig.channel, null, null);
      const localVideoTrack = await agoraClient.createCameraVideoTrack();
      localVideoTrack.play(localVideoRef.current);
      await agoraClient.publish(localVideoTrack);
    } catch (err) {
      console.error('Failed to join channel:', err);
    }
  };

  const leaveChannel = async () => {
    try {
      await agoraClient.leave();
    } catch (err) {
      console.error('Failed to leave channel:', err);
    }
  };

  return (
    <div>
      <h2>Video Call</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>Local</h3>
          <div ref={localVideoRef} style={{ width: '240px', height: '180px' }}></div>
        </div>
        <div>
          <h3>Remote</h3>
          <div ref={remoteVideoRef} style={{ width: '240px', height: '180px' }}></div>
        </div>
      </div>
      <div>
        <button onClick={joinChannel}>Join Call</button>
        <button onClick={leaveChannel}>Leave Call</button>
      </div>
    </div>
  );
};

export default VideoCall;
