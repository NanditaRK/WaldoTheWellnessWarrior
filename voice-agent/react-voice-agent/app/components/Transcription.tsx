// import { TextStreamData, useTranscriptions } from "@livekit/components-react";
// import React, { useEffect, useState } from "react";

// const Transcription = () => {
//   const transcriptions: TextStreamData[] = useTranscriptions();
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (transcriptions && transcriptions.length > 0) {
//       setIsLoading(false);
//     }
//   }, [transcriptions]);

//   if (isLoading) {
//     console.log("Waiting for transcriptions...");
//     return null;
//   }

//   console.log("Transcriptions data available:", transcriptions);

//   return null;
// };

// export default Transcription;
