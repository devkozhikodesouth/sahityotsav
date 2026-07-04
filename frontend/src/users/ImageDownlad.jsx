import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

function ImageDownload({ results, category, item, color, image, positions, activeAd }) {
  const downloadImageRef = useRef(null);
  const containerRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || 350;
        const maxAvailableWidth = parentWidth - 32; 
        if (maxAvailableWidth < 350) {
          setScaleFactor(Math.max(0.5, maxAvailableWidth / 350));
        } else {
          setScaleFactor(1);
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleDownloadImage = async () => {
    toast.loading("Generating image...");
    try {
      const element = downloadImageRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 4, 
      });
      const data = canvas.toDataURL("image/jpeg", 0.95);
      toast.dismiss();

      const link = document.createElement("a");
      link.href = data;
      link.download = `${category}-${item}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate image.");
      console.error(err);
    }
  };

  const baseWidth = 350;
  const targetWidth = 350;
  const adHeight = 87.5;
  const scale = targetWidth / baseWidth; // 1.0

  return (
    <>
      {results?.result && (
        <div ref={containerRef} className="flex flex-col items-center w-full">
          {/* Scaling wrapper to prevent overflow on mobile */}
          <div
            className="flex items-center justify-center overflow-hidden mb-6"
            style={{
              width: `${targetWidth * scaleFactor}px`,
              height: `${(activeAd ? targetWidth + adHeight : targetWidth) * scaleFactor}px`,
            }}
          >
            {/* Main Downloadable Container (captured by html2canvas) */}
            <div
              className="relative text-center bg-[#050706] overflow-hidden flex flex-col items-center drop-shadow-xl"
              ref={downloadImageRef}
              id="downloadImage"
              style={{ 
                width: `${targetWidth}px`, 
                height: activeAd ? `${targetWidth + adHeight}px` : `${targetWidth}px`,
                transform: `scale(${scaleFactor})`,
                transformOrigin: "top left",
                flexShrink: 0
              }}
            >
              {/* 1. Result Certificate Section */}
              <div 
                className="relative flex-shrink-0"
                style={{ width: `${targetWidth}px`, height: `${targetWidth}px` }}
              >
                <img
                  className="max-w-full object-cover h-full w-full"
                  src={image}
                  alt="Background"
                />
                <div
                  className="absolute flex flex-col text-left"
                  style={{
                    top: `${(positions?.y ?? 140) * scale}px`,
                    left: `${(positions?.x ?? 45) * scale}px`,
                  }}
                >
                  <div className="text-start">
                    <div 
                      className={`montserrat-semibold ${color}`}
                      style={{ fontSize: `${10 * scale}px` }}
                    >
                      {category}
                    </div>
                    <div 
                      className={`montserrat-bold ${color}`}
                      style={{ fontSize: `${15 * scale}px`, marginTop: `${-6 * scale}px` }}
                    >
                      {item}
                    </div>
                  </div>

                  <div 
                    className="text-start"
                    style={{ marginTop: `${10 * scale}px`, paddingLeft: `${10 * scale}px` }}
                  >
                    {results?.result?.map((result, index) => {
                      let winners = [];
                      if (result?.winners) {
                        winners = result.winners;
                      } else {
                        const name = result?.firstPrize || result?.secPrize || result?.thirdPrize;
                        const team = result?.firstTeam || result?.secTeam || result?.thirdTeam;
                        if (name) winners = [{ name, team }];
                      }

                      return (
                        <div key={index} style={{ marginBottom: `${6 * scale}px` }}>
                          {winners.map((winner, wIdx) => (
                            <div key={wIdx} style={{ marginTop: wIdx > 0 ? `${4 * scale}px` : "0px" }}>
                              <div 
                                className={`leading-tight font-biorhyme font-bold ${color}`}
                                style={{ fontSize: `${12 * scale}px` }}
                              >
                                {winner.name || ""}
                              </div>
                              <div 
                                className={`leading-tight montserrat-regular ${color}`}
                                style={{ fontSize: `${10 * scale}px` }}
                              >
                                {winner.teamId?.teamName || winner.team || ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. Advertisement Section */}
              {activeAd && (
                <div 
                  className="overflow-hidden bg-primary border-t border-accent/25 flex items-center justify-center relative flex-shrink-0"
                  style={{ width: `${targetWidth}px`, height: `${adHeight}px` }}
                >
                  <img
                    src={activeAd.path}
                    alt={activeAd.title || "Ad"}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Download Button (Excluded from download element) */}
          <button
            onClick={handleDownloadImage}
            className="mb-4 px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-50"
          >
            Download
          </button>


        </div>
      )}
    </>
  );
}

export default ImageDownload;
