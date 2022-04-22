import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router';

import { usePublisher } from '../../hooks/usePublisher';
import { useSession } from '../../hooks/useSession';
import React from 'react';
// import { apiKey, token, sessionId } from '../../config';
import { useScreenSharing } from '../../hooks/useScreenSharing';
import { getCredentials } from '../../api/fetchCreds';

import ToolBar from '../ToolBar';

function Main() {
  const videoContainer = useRef();
  const [publishing, setIsPublishing] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  // const { startAnnotation, informAnnotation, end, hasAnnotation } =
  //   useAnnotation({ session });

  const screenContainer = useRef();
  const [screenSharing, setScreenSharing] = useState(false);
  const { session, createSession, connected, streams, layout } = useSession({
    container: videoContainer,
  });
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState(null);
  let { roomName } = useParams();

  const { publisher, publish, pubInitialised } = usePublisher();
  const {
    publishScreen,
    pubScreenInitialised,
    isPublishingScreen,
    destroyPublisher,
    unpublish,
  } = useScreenSharing();

  const handleAudioChange = useCallback(() => {
    if (hasAudio) {
      publisher.publishAudio(false);
      setHasAudio(false);
      try {
        navigator.mediaSession.setMicrophoneActive(false);
      } catch (e) {
        console.log(e);
      }
    } else {
      publisher.publishAudio(true);
      setHasAudio(true);
      try {
        navigator.mediaSession.setMicrophoneActive(true);
      } catch (e) {
        console.log(e);
      }
    }
  }, [hasAudio, publisher]);

  const handleVideoChange = useCallback(() => {
    if (hasVideo) {
      publisher.publishVideo(false);
      setHasVideo(false);
      try {
        navigator.mediaSession.setCameraActive(false);
      } catch (e) {
        console.log(e);
      }
    } else {
      publisher.publishVideo(true);
      setHasVideo(true);
      try {
        navigator.mediaSession.setCameraActive(true);
      } catch (e) {
        console.log(e);
      }
    }
  }, [hasVideo, publisher]);

  useEffect(() => {
    getCredentials(roomName)
      .then(({ data }) => {
        setCredentials({
          apiKey: data.apiKey,
          sessionId: data.sessionId,
          token: data.token,
        });
      })
      .catch((err) => {
        setError(err);
        console.log(err);
      });
  }, [roomName]);

  useEffect(() => {
    if (credentials) {
      const { apiKey, sessionId, token } = credentials;
      console.log(apiKey);
      createSession({ apiKey, sessionId, token });
    }
  }, [createSession, credentials]);

  const handleScreen = async () => {
    if (!isPublishingScreen) {
      publishScreen({
        session: session.current,
        containerId: videoContainer.current.id,
      });
    } else {
      destroyPublisher();
    }
  };

  useEffect(() => {
    if (
      session.current &&
      connected &&
      !pubInitialised &&
      videoContainer.current
    ) {
      publish({
        session: session.current,
        containerId: videoContainer.current.id,
      });
      setIsPublishing(true);
      layout.layout();
    }
  }, [publish, session, connected, pubInitialised, layout]);

  return (
    <>
      <div className="main">
        <div
          // id="screen-container"
          //   className="screen"
          // ref={screenContainer}
          ref={videoContainer}
          id="video-container"
          // className={isPublishingScreen ? 'screensharing' : 'hidden'}
          className={'container'}
        ></div>
        {/* <div
          className={'videoSmall'}
          ref={videoContainer}
          id="video-container"
        ></div> */}
      </div>
      <ToolBar
        handleAudioChange={handleAudioChange}
        handleVideoChange={handleVideoChange}
        session={session.current}
        hasAudio={hasAudio}
        hasVideo={hasVideo}
        publishScreen={publishScreen}
        handleScreen={handleScreen}
      />
    </>
  );
}

export default Main;
