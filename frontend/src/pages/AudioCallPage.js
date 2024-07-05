import React, { useState } from 'react';
import AudioCall from '../components/AudioCall';

const AudioCallPage = () => {
  const {
    remoteUsers,
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
  } = AudioCall();

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
        <button onClick={() => { setChannelName(channelName); generateToken(); }}>Generate Token</button>
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
                <div key={user}>User ID: {user}</div>
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
