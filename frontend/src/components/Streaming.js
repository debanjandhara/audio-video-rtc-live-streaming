// import React, { useEffect, useRef } from 'react';
// import AgoraRTC from 'agora-rtc-sdk';
// import { agoraConfig } from '../utils/agora';

// const Streaming = () => {
//     const localVideoRef = useRef(null);

//     useEffect(() => {
//         const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

//         agoraClient.init(agoraConfig.appId, () => {
//             console.log('AgoraRTC client initialized');
//         });

//         // Join channel logic
//         // Handle streaming tracks
//         // Implement Agora SDK integration here

//         return () => {
//             agoraClient.leave(); // Leave channel when component unmounts
//         };
//     }, []);

//     return (
//         <div>
//             <div className="relative mb-4" style={{ width: '640px', height: '480px' }}>
//                 <video ref={localVideoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full" />
//             </div>
//             {/* Display streaming controls */}
//         </div>
//     );
// };

// export default Streaming;
