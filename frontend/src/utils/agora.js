// import AgoraRTC from 'agora-rtc-sdk-ng';

export async function getAgoraToken(appId, channelName, userName) {
  const token = await fetch(`http://127.0.0.1:8000/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channelName, userName }),
  })
    .then((res) => res.json())
    .then((data) => data.token)
    .catch((err) => {
      console.error('Failed to fetch Agora token:', err);
      return null;
    });

  return token;
}
