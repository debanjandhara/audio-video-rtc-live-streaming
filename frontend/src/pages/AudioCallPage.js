import React from 'react';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2 lg:w-1/3">
        <h2 className="text-2xl font-semibold mb-4">Agora Audio Call</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Channel Name:
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </label>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => { setChannelName(channelName); generateToken(); }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Generate Token
            </button>
            <button
              onClick={joinChannel}
              disabled={joined}
              className={`px-4 py-2 rounded ${joined ? 'bg-gray-300' : 'bg-green-500 text-white hover:bg-green-700'}`}
            >
              Join Channel
            </button>
            <button
              onClick={leaveChannel}
              disabled={!joined}
              className={`px-4 py-2 rounded ${!joined ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-700'}`}
            >
              Leave Channel
            </button>
            <button
              onClick={toggleMute}
              disabled={!joined}
              className={`px-4 py-2 rounded ${!joined ? 'bg-gray-300' : 'bg-yellow-500 text-white hover:bg-yellow-700'}`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>
        {joined && (
          <div className="mb-4">
            <button
              onClick={publishTrack}
              disabled={isPublished}
              className={`bg-purple-500 text-white px-4 py-2 rounded mr-2 ${isPublished ? 'bg-gray-300' : 'hover:bg-purple-700'}`}
            >
              Publish Track
            </button>
            <button
              onClick={unpublishTrack}
              disabled={!isPublished}
              className={`bg-purple-500 text-white px-4 py-2 rounded ${!isPublished ? 'bg-gray-300' : 'hover:bg-purple-700'}`}
            >
              Unpublish Track
            </button>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            User ID:
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </label>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={subscribeToUser}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Subscribe to User
            </button>
            <button
              onClick={unsubscribeFromUser}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Unsubscribe from User
            </button>
          </div>
        </div>
      </div>
      {joined ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2 lg:w-1/3 mt-4">
          <h3 className="text-xl font-semibold mb-2">Channel: {channelName}</h3>
          <h4 className="text-lg mb-2">User Name: {sessionId}</h4>
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Remote Users</h4>
            {remoteUsers.length > 0 ? (
              remoteUsers.map((user) => (
                <div key={user} className="text-gray-700">User ID: {user}</div>
              ))
            ) : (
              <p className="text-gray-500">No remote users connected.</p>
            )}
          </div>
          <p className="text-green-500">Successfully connected to the channel.</p>
        </div>
      ) : (
        <p className="text-gray-500">
          {token ? 'Token generated. Ready to join the channel.' : 'Generate a token to join the channel.'}
        </p>
      )}
    </div>
  );
};

export default AudioCallPage;
