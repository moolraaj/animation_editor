import React, { useEffect, useRef } from "react";

interface PreviewProps {
  backgroundImage: string | null;
  svgContainerRef: React.RefObject<HTMLCanvasElement>;
  svgPosition: { x: number; y: number };
  setSvgPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  applyLayerStyles: (svg: string, layersToHighlight: string[]) =>string;
  selectedSvg: string | null;
  selectedLayers: string[];

}

const SvgPreviewMain: React.FC<PreviewProps> = ({
  backgroundImage,
  svgContainerRef,
  svgPosition,
  setSvgPosition,
  applyLayerStyles,
  selectedSvg,
  selectedLayers,
  
}) => {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default drag behavior
    e.stopPropagation(); // Prevent propagation to parent elements

    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - svgPosition.x,
      y: e.clientY - svgPosition.y,
    };
  };

  const onDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging.current) return;

    setSvgPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isDragging.current = false;
  };

  useEffect(() => {
    if (!svgContainerRef.current || !selectedSvg) {
      return;
    }

    const canvas = svgContainerRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Canvas context could not be initialized.");
      return;
    }

 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load the SVG content dynamically
    const svgContent = applyLayerStyles(selectedSvg, selectedLayers);
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      ctx.drawImage(img, svgPosition.x, svgPosition.y, canvas.width, canvas.height);
      URL.revokeObjectURL(url); // Clean up the object URL
    };

    img.onerror = () => {
      console.error("Failed to load SVG image.");
    };

    img.src = url;
  }, [svgContainerRef, selectedSvg, selectedLayers, svgPosition, applyLayerStyles]);

  return (
    <div
      className="right-side-inner"
       
      
    >
      <img src={backgroundImage||''} alt="" />
      <canvas
        ref={svgContainerRef}
        height={600}
        width={800}
        className="svg-preview-container"
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{
          cursor: "move",
          border: "1px solid #000",
        }}
      />
    </div>
  );
};

export default SvgPreviewMain;
