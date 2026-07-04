import React, { useEffect, useState } from "react";
import { getlivelink } from "../api/apiCall";

function VideoLink() {
  const [stage, setStage] = useState("First Stage");
  const [lives, setLives] = useState([{ url: null }, { url: null }]);

  useEffect(() => {
    const fetchLiveLinks = async () => {
      try {
        const response = await getlivelink();

        if (response?.data) {
          const live1Url = response.data.live1?.url || null;
          const live2Url = response.data.live2?.url || null;

          const embeddedLive1 = convertToEmbedUrl(live1Url);
          const embeddedLive2 = convertToEmbedUrl(live2Url);

          setLives([{ url: embeddedLive1 }, { url: embeddedLive2 }]);

          // If only live2 exists, default to Second Stage
          if (!embeddedLive1 && embeddedLive2) {
            setStage("Second Stage");
          }
        }
      } catch (error) {
        console.error("Failed to fetch live links:", error);
      }
    };

    fetchLiveLinks();
  }, []);

  const convertToEmbedUrl = (url) => {
    const match = url?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
    );
    return match
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1`
      : null;
  };

  const handleStageSwitch = () => {
    if (stage === "First Stage" && lives[1]?.url) {
      setStage("Second Stage");
    } else if (stage === "Second Stage" && lives[0]?.url) {
      setStage("First Stage");
    }
  };

  const currentUrl = stage === "First Stage" ? lives[0]?.url : lives[1]?.url;
  const hasLive1 = !!lives[0]?.url;
  const hasLive2 = !!lives[1]?.url;
  const showSwitchButton = hasLive1 && hasLive2;

  return (
    <div id="live" className="flex flex-col items-center pt-12 pb-10 md:pt-16 md:pb-12 bg-secondary relative overflow-hidden paper-texture border-t border-b border-accent/20">
      {/* Decorative corners */}
      <div className="hidden md:block absolute top-6 left-6 w-12 h-12 border-t border-l border-accent/30 pointer-events-none"></div>
      <div className="hidden md:block absolute top-6 right-6 w-12 h-12 border-t border-r border-accent/30 pointer-events-none"></div>

      <h2 className="py-4 text-4xl lg:text-5xl text-accent font-heading font-black tracking-wide text-center">
        Live Stream
      </h2>
      <div className="divider-vintage-ornamental max-w-xs mx-auto mb-6 w-full text-accent/50"></div>

      {(hasLive1 || hasLive2) && (
        <h3 className="text-sm md:text-base text-surface font-heading font-semibold tracking-widest mb-6 uppercase bg-primary/40 px-5 py-2 rounded-full border border-accent/20">
          {stage}
        </h3>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-md z-10">
        <div className="relative w-full rounded-xl overflow-hidden border-2 border-accent/40 shadow-2xl p-2 bg-surface/5" style={{ paddingTop: "56.25%" }}>
          {currentUrl ? (
            <iframe
              className="absolute top-2 left-2 right-2 bottom-2 w-[calc(100%-16px)] h-[calc(100%-16px)] rounded-lg shadow-inner"
              src={`${currentUrl}?autoplay=1&mute=1&modestbranding=1&rel=0&controls=1&showinfo=0`}
              title="YouTube Live Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute top-2 left-2 right-2 bottom-2 flex flex-col items-center justify-center bg-secondary/80 text-surface/85 font-heading font-semibold border border-dashed border-accent/20 rounded-lg">
              <span className="iconify text-3xl text-accent mb-2" data-icon="mdi:video-off-outline"></span>
              No live stream available
            </div>
          )}
        </div>
      </div>

      {showSwitchButton && (
        <button
          onClick={handleStageSwitch}
          className="mt-8 px-8 py-3 bg-primary border border-accent/40 text-surface rounded-xl font-heading font-bold hover:bg-primary-light hover:text-white transition-all shadow-lg active:scale-95"
        >
          Switch to {stage === "First Stage" ? "Second Stage" : "First Stage"}
        </button>
      )}
    </div>
  );
}

export default VideoLink;
