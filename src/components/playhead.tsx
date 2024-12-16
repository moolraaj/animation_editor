import React from 'react';

interface PlayHeadProps {
  playheadPosition: number; // Position of the playhead (percentage)
  cumulativeDurations: number[]; // Array of cumulative durations for the timeline
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void; // Mouse down handler
  handleMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void; // Mouse move handler
  handleMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void; // Mouse up handler
}

const PlayHead: React.FC<PlayHeadProps> = ({
  playheadPosition,
  cumulativeDurations,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}) => {
  const isRulerVisible = cumulativeDurations && cumulativeDurations.length > 0;

  return (
    <>
      <div
        className="timeline"
        style={{
          position: 'relative',
          height: '30px',
          marginTop: '-68px',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Conditionally render the playhead only if the ruler is visible */}
        {isRulerVisible && (
          <div
            className="playhead"
            style={{
              position: 'absolute',
              left: `${playheadPosition}%`,
              width: '1px',
              height: '100%',
              backgroundColor: '#007bff',
              transition: 'left 0.1s linear',
            }}
          ></div>
        )}
      </div>
    </>
  );
};

export default PlayHead;
