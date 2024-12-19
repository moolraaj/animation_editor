import React from "react";

interface Slide {
  svg: string;
  animationType: string | null;
  duration: number;
  index: number;
  isPlaying: boolean;
}

interface TimelineProps {
  slideForTimeline: {
    svg: string;
    animationType: string | null;
    duration: number;
    index: number;
    isPlaying: boolean; // New property to track play state
  }[];
  handleSvgClick: (svg: string, index: number) => void; // Function to handle SVG click
  replayActivities: () => void; // Function to replay activities
 
  playheadPosition: number; // Position of the playhead
  currentReplayIndex: number | null; // Index of the currently replaying slide
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void; // Mouse down handler
  handleMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void; // Mouse move handler
  handleMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void; // Mouse up handler
  playPauseAni: () => void; // Function to toggle play/pause
}

const TimeLine: React.FC<TimelineProps> = ({
  slideForTimeline,
  handleSvgClick,
  replayActivities,
  
  playheadPosition,
  currentReplayIndex,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  playPauseAni,
}) => {
  // Filter slides with animations assigned
  const filteredSlides = slideForTimeline.filter((slide) => slide.animationType);

  // Calculate cumulative durations (in milliseconds)
  const cumulativeDurations = filteredSlides.reduce<number[]>((acc, slide) => {
    const lastTime = acc.length > 0 ? acc[acc.length - 1] : 0;
    const newTime = lastTime + slide.duration; // Keep duration in milliseconds
    return [...acc, newTime];
  }, []);

  // Total duration in milliseconds and seconds
  const totalDurationInMs = cumulativeDurations[cumulativeDurations.length - 1] || 0;
  const totalSeconds = Math.ceil(totalDurationInMs / 1000);

  // Determine whether the ruler and playhead should be visible
  const isRulerVisible = filteredSlides.length > 0;

  return (
    <div className="timeline-container">
      <h3>Timeline:</h3>
      <div className="timeline_buttons">
      <button onClick={replayActivities} style={{ marginTop: "20px" }}>
        Render Timeline
      </button>
       
      <button style={{ marginBottom: "10px" }} onClick={playPauseAni}>
        Play
      </button>
      </div>
    

      
      {isRulerVisible && (
        <>
          <div
            className="time-ruler"
            style={{
              position: "relative",
              marginTop: "10px",
              height: "50px",
              display: "grid",
              gridTemplateColumns: filteredSlides
                .map((slide) => `${(slide.duration / totalDurationInMs) * 100}%`)
                .join(" "),
              borderTop: "1px solid gray",
            }}
          >
            {filteredSlides.map((slide, slideIndex) => (
              <div
                key={slideIndex}
                style={{
                  position: "relative",
                  height: "100%",
                }}
              >
                {Array.from({ length: Math.ceil(slide.duration / 100) }).map((_, tickIndex) => {
                  const ms = tickIndex * 100; // Increment in milliseconds
                  const isSecond = ms % 1000 === 0;

                  return (
                    <div
                      key={tickIndex}
                      style={{
                        position: "absolute",
                        left: `${(ms / slide.duration) * 100}%`,
                        height: isSecond ? "20px" : "10px",
                        borderLeft: "1px solid gray",
                      }}
                    />
                  );
                })}
                {/* Ensure the last tick is added */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    height: "20px",
                    borderLeft: "1px solid gray",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Seconds Labels */}
          <div
            style={{
              position: "relative",
              height: "20px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginTop: "-25px", // Adjust to align better with the ruler
              paddingRight: "2px", // Ensure last second fits
            }}
          >
            {Array.from({ length: totalSeconds + 1 }).map((_, second) => (
              <span
                key={second}
                style={{
                  flex: "0 0 auto",
                  textAlign: "center",
                }}
              >
                {second}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Playhead */}
      {isRulerVisible && (
        <div
          className="timeline"
          style={{
            position: "relative",
            height: "50px",
            marginTop: "-68px",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="playhead"
            style={{
              position: "absolute",
              left: `${playheadPosition}%`,
              width: "16px",
              height: "16px",
              backgroundColor: "#007bff",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              top: "50%",
              transition: "left 0.1s linear",
              cursor: "grab",
            }}
          ></div>
        </div>
      )}

      {/* SVG Slides */}
      <div
        className="svg-container-for-timeline"
        style={{
          display: "grid",
          gridTemplateColumns: filteredSlides
            .map((slide) => `${(slide.duration / totalDurationInMs) * 100}%`)
            .join(" "),
          gap: "2px",
          alignItems: "center",
        }}
      >
        {slideForTimeline.length > 0 ? (
          slideForTimeline.map((slide: Slide) => (
            <div
              key={slide.index}
              className={`timeline-wrapper ${
                currentReplayIndex === slide.index ? "active" : ""
              }`}
              style={{
                border: "1px solid #ccc",
                position: "relative",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: slide.svg }}
                onClick={() => handleSvgClick(slide.svg, slide.index)}
              />
              <p>{slide.animationType}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "gray", fontSize: "14px" }}>
            No slides in the timeline.
          </p>
        )}
      </div>
    </div>
  );
};

export default TimeLine;
