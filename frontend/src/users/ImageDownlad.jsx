import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

function ImageDownload({ results, category, item, color, image, positions, activeAd }) {
  const downloadImageRef = useRef(null);

  // Define class names in variables
  const containerClass = "mx-auto drop-shadow-xl   ";

  const imageContainerClass = "relative h-[350px] w-[350px] mb-24";
  const backgroundImageClass = "max-w-full object-cover h-full w-full";
  const overlayClass =
    "absolute top-2 left-5 md:left-5 md:top-2 right-0 bottom-0 flex flex-col p-4";
  const flexRowClass = "flex flex-row";
  const resultTextClass = `text-3xl  poppins-bold ${color}`;
  const categoryTextClass = `text-sm poppins-bold ${color}`;
  const unitTextClass = `text-sm/[14px]  poppins-bold ${color}`;
  const unitSmallTextClass = `text-[10px] mb-1 poppins-light  ${color}`;
  const buttonClass =
    "mt-4 px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-50";

  const handleDownloadImage = async () => {
    toast.loading("Downloading");
    const element = downloadImageRef.current;
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 6, // Increase the scale to improve image quality
    });
    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    link.href = data;
    link.download = `${category}-${item}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.dismiss();
  };

  const baseWidth = 350;
  const targetWidth = 518.4;
  const adHeight = 129.6;
  const scale = targetWidth / baseWidth; // 1.481142857

  return (
    <>
      {results?.result && (
        <div className="flex flex-col items-center">
          {/* Main Downloadable Container (captured by html2canvas) */}
          <div
            className="relative mx-auto drop-shadow-xl text-center bg-[#050706] overflow-hidden mb-6 flex flex-col items-center"
            ref={downloadImageRef}
            id="downloadImage"
            style={{ 
              width: `${targetWidth}px`, 
              height: activeAd ? `${targetWidth + adHeight}px` : `${targetWidth}px` 
            }}
          >
            {/* 1. Result Certificate Section (518.4x518.4) */}
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
                              {winner.name?.toLowerCase()?.replace(/^\w/, (c) => c.toUpperCase()) || ""}
                            </div>
                            <div 
                              className={`leading-tight montserrat-regular ${color}`}
                              style={{ fontSize: `${10 * scale}px` }}
                            >
                              {(winner.teamId?.teamName || winner.team)?.toLowerCase()?.replace(/^\w/, (c) => c.toUpperCase()) || ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Advertisement Section (518.4x129.6) */}
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

          {/* Download Button (Excluded from download element) */}
          <button
            onClick={handleDownloadImage}
            className="mb-24 px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-50"
          >
            Download
          </button>
        </div>
      )}
    </>
  );
}

export default ImageDownload;
