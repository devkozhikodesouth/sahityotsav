import React, { useEffect, useRef } from "react";

function VideoPlayer({ videoId }) {
  const playerRef = useRef(null);

  useEffect(() => {
    // Load YouTube Iframe API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      createPlayer();
    }

    // Called when the API is ready
    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    function createPlayer() {
      if (!window.YT || !videoId) return;

      new window.YT.Player(`yt-player-${videoId}`, {
        videoId,
        events: {
          onReady: (event) => {
            playerRef.current = event.target;

            // Fullscreen detection
            document.addEventListener("fullscreenchange", () => {
              if (document.fullscreenElement) {
                playerRef.current.playVideo();
              } else {
                playerRef.current.pauseVideo();
              }
            });
          },
        },
      });
    }
  }, [videoId]);

  return (
    <div className="w-full aspect-video">
      <div id={`yt-player-${videoId}`} />
    </div>
  );
}

export default VideoPlayer;
