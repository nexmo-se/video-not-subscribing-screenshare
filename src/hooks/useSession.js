import React, { useState, useRef, useCallback } from 'react';
import OT from '@opentok/client';
import LM from 'opentok-layout-js';

export function useSession({ container }) {
  const [connected, setConnected] = useState(false);
  const [streams, setStreams] = useState([]);
  const sessionRef = useRef(null);
  const layout = useRef(null);
  const resizeTimeout = useRef(null);

  React.useEffect(() => {
    if (container.current) {
      const element = document.getElementById(container.current.id);
      if (element) {
        layout.current = LM(element, {
          // fixedRatio: true,
          // bigFirst: false,
          bigFixedRatio: true,
          maxRatio: 3 / 2,
          minRatio: 9 / 16,
          bigAlignItems: 'left',
          ignoreClass: 'OT_ignore',
        });

        layout.current.layout();

        window.onresize = function () {
          clearTimeout(resizeTimeout);
          resizeTimeout.current = setTimeout(function () {
            layout.current.layout();
          }, 20);
        };
      }
    }
  }, [container]);

  const addStream = ({ stream }) => {
    setStreams((prev) => [...prev, stream]);
  };

  const removeStream = ({ stream }) => {
    setStreams((prev) =>
      prev.filter((prevStream) => prevStream.id !== stream.id)
    );
  };

  const subscribe = React.useCallback(
    (stream, options = {}) => {
      if (sessionRef.current && container.current) {
        const finalOptions = Object.assign({}, options, {
          insertMode: 'append',
          // width: '50%',
          // height: '50%',
          fitMode: 'contain',
          style: {
            buttonDisplayMode: 'off',
            nameDisplayMode: 'on',
          },
          showControls: false,
        });
        const subscriber = sessionRef.current.subscribe(
          stream,
          container.current.id,
          finalOptions
        );
        layout.current.layout();
      }
    },
    [container]
  );

  const onStreamCreated = useCallback(
    (event) => {
      console.log(event);
      if (event.stream.videoType !== 'screen') {
        subscribe(event.stream);
      }
      layout.current.layout();
      addStream({ stream: event.stream });
    },
    [subscribe]
  );

  const onStreamDestroyed = useCallback((event) => {
    removeStream({ stream: event.stream });
  }, []);

  const createSession = useCallback(
    ({ apiKey, sessionId, token }) => {
      if (!apiKey) {
        throw new Error('Missing apiKey');
      }

      if (!sessionId) {
        throw new Error('Missing sessionId');
      }

      if (!token) {
        throw new Error('Missing token');
      }
      console.log('session creation request');

      sessionRef.current = OT.initSession(apiKey, sessionId, {
        // iceConfig: {
        //   includeServers: 'all',
        //   transportPolicy: 'relay',
        //   customServers: [
        //     {
        //       urls: []
        //     }
        //   ]
        // }
      });
      const eventHandlers = {
        streamCreated: onStreamCreated,
        streamDestroyed: onStreamDestroyed,
      };
      sessionRef.current.on(eventHandlers);
      return new Promise((resolve, reject) => {
        sessionRef.current.connect(token, (err) => {
          if (!sessionRef.current) {
            // Either this session has been disconnected or OTSession
            // has been unmounted so don't invoke any callbacks
            return;
          }
          if (err) {
            reject(err);
          } else if (!err) {
            console.log('Session Connected!');
            setConnected(true);
            resolve(sessionRef.current);
          }
        });
      });
    },
    [onStreamCreated, onStreamDestroyed]
  );

  const destroySession = React.useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.on('disconnected', () => {
        sessionRef.current = null;
      });
      sessionRef.current.disconnect();
    }
  }, []);

  return {
    session: sessionRef,
    connected,
    createSession,
    destroySession,
    streams,
    layout: layout.current,
  };
}
