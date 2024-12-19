'use client';






import Animations from "@/components/animations";

import Layers from "@/components/layers";
// import Layers from "@/components/layers";
import Preview from "@/components/preview";
import { ANIMATION_TIME_LINE, HANDSTAND, WALKING } from "@/utils/animationsType";

// import SelectSvg from "@/components/selectSvg";
import React, { useState, useEffect, useRef } from "react";

const Page: React.FC = () => {
  const [svgDataList, setSvgDataList] = useState<string[]>([]);
  const [selectedSvg, setSelectedSvg] = useState<string | null>(null);
  const [slideForTimeline, setAddSlideRimeline] = useState<
    {
      svg: string;
      animationType: string | null;
      duration: number;
      index: number;
      isPlaying: boolean;
    }[]
  >([]);


  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);


  const svgContainerRef = useRef<HTMLCanvasElement | null>(null);



  const animationFrameId = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);


  const [selectedSvgIndex, setSelectedSvgIndex] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(100);


  const [activityLog, setActivityLog] = useState<
    { type: string; slideIndex: number; animationType?: string }[]
  >([]);
  const [currentReplayIndex, setCurrentReplayIndex] = useState<number | null>(null);
  const [svgPosition, setSvgPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [playheadPosition, setPlayheadPosition] = useState(0);







  const [dragging, setDragging] = useState(false);
  const [draggedSeconds, setDraggedSeconds] = useState<number | null>(null);



  console.log(activityLog)

  const handlePlayPauseForSelectedSlide = () => {
    if (selectedSvgIndex === null) {
      console.warn("No slide selected.");
      return;
    }


    setAddSlideRimeline((prevSlides) =>
      prevSlides.map((slide) => {
        if (slide.index === selectedSvgIndex) {
          if (slide.isPlaying) {
            setCurrentReplayIndex(slide.index)
            return { ...slide, isPlaying: false };
          } else {
            // Play animation
            if (slide.animationType === WALKING) {
              wlkingAnimationPlay(slide.svg);
            } else if (slide.animationType === HANDSTAND) {
              handStandanimationPlay(slide.svg);
            }
            return { ...slide, isPlaying: true };
          }
        }
        return slide;
      })
    );


    setTimeout(() => {
      setAddSlideRimeline((prevSlides) =>
        prevSlides.map((slide) =>
          slide.index === selectedSvgIndex ? { ...slide, isPlaying: false } : slide
        )
      );
    }, ANIMATION_TIME_LINE);
  };


  console.log(contextMenuPosition)

  console.log(currentTime)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);


  const startRecording = () => {
    const canvas = svgContainerRef.current;
    if (!(canvas instanceof HTMLCanvasElement)) {
      console.warn("Canvas not found or is not a valid HTMLCanvasElement.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas context not available.");
      return;
    }

    if (backgroundImage) {
      const bgImg = new Image();
      bgImg.src = backgroundImage;

      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height); // Draw background image
      };

      bgImg.onerror = () => {
        console.error("Failed to load background image.");
      };
    }

    const stream = canvas.captureStream(30);
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.start();
    console.log("Recording started...");
  };


  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      console.log("Recording stopped...");
    }
  };

  const downloadVideo = () => {
    const blob = new Blob(recordedChunks.current, { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "activities-logs.mp4";

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log("Video downloaded...");
  };


  useEffect(() => {
    const savedSVGs = localStorage.getItem("uploadedSVGs");
    if (savedSVGs) {
      const svgList = JSON.parse(savedSVGs);
      setSvgDataList(svgList);
      setSelectedSvg(svgList[0] || null);
    }

    const savedBackground = localStorage.getItem("backgroundImage");
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  const parseSvgLayers = (svg: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, "image/svg+xml");

    const getLayers = svgDoc.documentElement.querySelectorAll(":scope > g");

    const layersWithChildren = Array.from(getLayers).map((layer, index) => {
      return {
        index: index, // Index of the layer
        id: layer.id || `Layer ${index}`, // Name of the layer
        children: Array.from(layer.children) // Array of children for this layer
      };
    });

    return layersWithChildren;
  };


  const handleLayerClick = (layerId: string) => {
    setSelectedLayers([layerId]); // Select only the clicked layer
  };



  let animationStarted = false;
  let initialTimestamp = 0;

  const animate = (svg: string, timestamp: number) => {
    if (!animationStarted) {
      initialTimestamp = timestamp;
      animationStarted = true;
    }
  
    const elapsedTime = timestamp - initialTimestamp;
  
    if (elapsedTime >= ANIMATION_TIME_LINE) {
      console.log("Animation completed.");
      animationStarted = false;
      cancelAnimationFrame(animationFrameId.current!); // Stop further animation
      return;
    }
  
    const canvas = svgContainerRef.current;
    if (!(canvas instanceof HTMLCanvasElement)) {
      console.warn("Canvas not found or is not a valid HTMLCanvasElement.");
      return;
    }
  
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas context not available.");
      return;
    }
  
    // Parse the SVG and retrieve elements
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
  
    // Select specific elements for animation
    const leftHand = svgElement.querySelector("#hand-details-back");
    const rightHand = svgElement.querySelector("#hand-details-front");
    const leftLeg = svgElement.querySelector("#pant-back-details");
    const rightLeg = svgElement.querySelector("#pant-front-details");
    const legFront = svgElement.querySelector("#leg-front");
    const legBack = svgElement.querySelector("#leg-back");
    const footFront = svgElement.querySelector("#shoe-front");
    const footBack = svgElement.querySelector("#shoe-back");
  
    // Ensure all elements exist
    if (
      !leftHand ||
      !rightHand ||
      !leftLeg ||
      !rightLeg ||
      !legFront ||
      !legBack ||
      !footFront ||
      !footBack
    ) {
      console.warn("Some elements are missing in the SVG.");
      return;
    }
  
    // Animation logic for limb movement
    const stepDuration = 1000; // 1-second animation loop
    const elapsed = elapsedTime % stepDuration;
    const progress = elapsed / stepDuration;
  
    // Calculate swing values
    const handSwing = Math.sin(progress * 2 * Math.PI) * 20;
    const legSwing = Math.cos(progress * 2 * Math.PI) * 20;
    const legFrontSwing = Math.cos(progress * 2 * Math.PI) * 20;
    const legBackSwing = Math.cos(progress * 2 * Math.PI) * 20;
    const footFrontSwing = Math.cos(progress * 2 * Math.PI) * 20;
    const footBackSwing = Math.cos(progress * 2 * Math.PI) * 20;
  
    // Apply transformations to limbs
    leftHand.setAttribute("transform", `rotate(${handSwing} 920 400)`);
    rightHand.setAttribute("transform", `rotate(${-handSwing} 960 400)`);
    leftLeg.setAttribute("transform", `rotate(${legSwing} 1000 500)`);
    rightLeg.setAttribute("transform", `rotate(${-legSwing} 1000 500)`);
    legFront.setAttribute("transform", `rotate(${-legFrontSwing} 1000 500)`);
    legBack.setAttribute("transform", `rotate(${legBackSwing} 1000 500)`);
    footFront.setAttribute("transform", `rotate(${-footFrontSwing} 1000 500)`);
    footBack.setAttribute("transform", `rotate(${footBackSwing} 1000 500)`);
  
    // Horizontal movement: Move the SVG left to right
    const canvasWidth = canvas.width;
    const speed = 100; // Pixels per second
    svgPosition.x = (elapsedTime / 1000) * speed % canvasWidth; // Loop back when reaching the edge
  
    // Serialize the updated SVG
    const updatedSvg = new XMLSerializer().serializeToString(svgDoc);
    const svgBlob = new Blob([updatedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      ctx.drawImage(img, svgPosition.x, svgPosition.y, canvas.width, canvas.height); // Draw updated SVG
      URL.revokeObjectURL(url);
      console.log(`SVG drawn at position x: ${svgPosition.x.toFixed(2)}`);
    };
  
    img.onerror = () => {
      console.error("Failed to load updated SVG image.");
    };
  
    img.src = url;
  
    // Request the next frame
    animationFrameId.current = requestAnimationFrame((newTimestamp) =>
      animate(svg, newTimestamp)
    );
  };
  


  // Function to trigger the walking animation
  const wlkingAnimationPlay = (svg: string) => {
    if (!animationStarted) {
      animationFrameId.current = requestAnimationFrame((timestamp) => animate(svg, timestamp));
    }
  };




  ////////////////////////// hand stand animation


  const handstand = (svg: string, timestamp: number) => {
    if (!animationStarted) {
      initialTimestamp = timestamp;
      animationStarted = true;
    }

    const elapsedTime = timestamp - initialTimestamp;

    if (elapsedTime >= ANIMATION_TIME_LINE) {
      console.log("Animation completed.");
      animationStarted = false;
      cancelAnimationFrame(animationFrameId.current!);
      return;
    }



    const canvas = svgContainerRef.current;
    if (!(canvas instanceof HTMLCanvasElement)) {
      console.warn("Canvas not found or is not a valid HTMLCanvasElement.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas context not available.");
      return;
    }

    // Parse the SVG and retrieve elements
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    const leftHand = svgElement.querySelector("#hand-details-back");
    const rightHand = svgElement.querySelector("#hand-details-front");

    if (!leftHand || !rightHand) {
      console.warn("Some elements are missing in the SVG.");
      return;
    }

    const animations = {
      "hand-details-back": {
        keys: [
          { t: 0, v: 0 },
          { t: 400, v: -52.081355 },
          { t: 1200, v: -94.55654 },
          { t: 1700, v: -151.389937 },
          { t: 2300, v: -60.488341 },
          { t: 3000, v: 2.015952 },
        ],
        origin: { x: 933.544556, y: 375.9555 },
      },
      "hand-details-front": {
        keys: [
          { t: 0, v: 4.969917 },
          { t: 400, v: -61.364093 },
          { t: 1200, v: -85.395581 },
          { t: 1700, v: -158.456814 },
          { t: 2300, v: -43.159225 },
          { t: 3000, v: 5.235948 },
        ],
        origin: { x: 933.544556, y: 381.769245 },
      },
    };

    const interpolate = (keys: { t: number; v: number }[], currentTime: number) => {
      let prevKey = keys[0];
      let nextKey = keys[0];

      for (let i = 0; i < keys.length; i++) {
        if (currentTime >= keys[i].t) {
          prevKey = keys[i];
        }
        if (currentTime < keys[i].t) {
          nextKey = keys[i];
          break;
        }
      }

      const timeDiff = nextKey.t - prevKey.t || 1; // Prevent division by zero
      const valueDiff = nextKey.v - prevKey.v;
      const progress = (currentTime - prevKey.t) / timeDiff;

      return prevKey.v + valueDiff * progress;
    };

    const stepDuration = 3000;
    const elapsed = elapsedTime % stepDuration;

    Object.entries(animations).forEach(([id, { keys, origin }]) => {
      const element = svgElement.querySelector(`#${id}`);
      if (element) {
        const rotationValue = interpolate(keys, elapsed);
        element.setAttribute("transform", `rotate(${rotationValue} ${origin.x} ${origin.y})`);
      }
    });

    const updatedSvg = new XMLSerializer().serializeToString(svgDoc);
    const svgBlob = new Blob([updatedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, svgPosition.x, svgPosition.y, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      console.error("Failed to load updated SVG image.");
    };

    img.src = url;

    animationFrameId.current = requestAnimationFrame((newTimestamp) => handstand(svg, newTimestamp));
  };


  const handStandanimationPlay = (svg: string) => {
    if (!animationStarted) {
      animationFrameId.current = requestAnimationFrame((timestamp) => handstand(svg, timestamp));
    }
  };




  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const newSvgDataList: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type === "image/svg+xml") {
          const reader = new FileReader();
          reader.onload = (e) => {
            const svgContent = e.target?.result as string;
            newSvgDataList.push(svgContent);

            if (newSvgDataList.length === files.length) {
              const updatedList = [...svgDataList, ...newSvgDataList];
              setSvgDataList(updatedList);
              localStorage.setItem("uploadedSVGs", JSON.stringify(updatedList));
              setSelectedSvg(updatedList[0]);
            }
          };
          reader.readAsText(file);
        } else {
          alert(`File ${file.name} is not a valid SVG file.`);
        }
      });
    }
  };


  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedBackground = e.target?.result as string;
        setBackgroundImage(uploadedBackground);
        localStorage.setItem("backgroundImage", uploadedBackground);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const addAnimation = () => {
    const targetElement = document.querySelector('.timeline-test');
    if (targetElement) {
      targetElement.classList.toggle('animation-class');
      console.log('Animation added/removed on target element');
    }
  };


  const handleSvgClick = (svg: string, index: number) => {
    setSelectedSvg(svg);
    setSelectedSvgIndex(index);
    setCurrentReplayIndex(index);

  };



  // console.log(`selectedSvgIndex in left and timeline`)
  // console.log(selectedSvgIndex)

  // const handleLayerClick = (layerId: string) => {
  //   setSelectedLayers([layerId]); // Select only the clicked layer
  // };


  // const parseSvgLayers = (svg: string) => {
  //   const parser = new DOMParser();
  //   const svgDoc = parser.parseFromString(svg, "image/svg+xml");

  //   const getLayers = svgDoc.documentElement.querySelectorAll(":scope > g");

  //   const layersWithChildren = Array.from(getLayers).map((layer, index) => {
  //     return {
  //       index: index, // Index of the layer
  //       id: layer.id || `Layer ${index}`, // Name of the layer
  //       children: Array.from(layer.children) // Array of children for this layer
  //     };
  //   });

  //   return layersWithChildren;
  // };

  // Handle the play/pause functionality for the timeline
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prevTime) => {
          // Loop the time back to 0 when it reaches the end of the timeline
          if (prevTime >= 100) return 0;
          return prevTime + 1;
        });
      }, 1000); // Update every second
    } else if (!isPlaying && timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);





  const handleDeleteSvg = () => {
    if (selectedSvg) {
      // Remove from state
      const updatedList = svgDataList.filter((svg) => svg !== selectedSvg);
      setSvgDataList(updatedList);

      // Update localStorage
      localStorage.setItem("uploadedSVGs", JSON.stringify(updatedList));

      // Reset selected SVG
      setSelectedSvg(null);
    }
    setContextMenuPosition(null); // Hide context menu
  };




  const addSlideToTimeline = (event: React.MouseEvent<HTMLButtonElement>) => {
    const svgIndex = parseInt(event.currentTarget.getAttribute("data-index") || "0", 10);
    if (selectedSvg) {
      const newSlide = {
        svg: selectedSvg,
        animationType: null,
        index: currentIndex,
        duration: 0,
        isPlaying: false,
        svgIndex,
      };
      setAddSlideRimeline((prevSlides) => [...prevSlides, newSlide]);
      setCurrentIndex((prevIndex) => prevIndex + 1);


      setCurrentReplayIndex(currentIndex);


      setActivityLog((prevLog) => [
        ...prevLog,
        { type: "addSlide", slideIndex: currentIndex },
      ]);
    }
  };











  const handleWalkingAnimation = () => {
    if (selectedSvgIndex !== null) {
      setAddSlideRimeline((prevSlides) =>
        prevSlides.map((slide) => {
          if (slide.index === selectedSvgIndex) {
            // Log the animation assignment
            setActivityLog((prevLog) => [
              ...prevLog,
              { type: "assignAnimation", slideIndex: selectedSvgIndex, animationType: WALKING },
            ]);
            return {
              ...slide,
              animationType: slide.animationType === WALKING ? null : WALKING,
              duration: ANIMATION_TIME_LINE,
            };
          }
          return slide;
        })
      );
    }
  };




  const handlehandstandAnimation = () => {
    if (selectedSvgIndex !== null) {
      setAddSlideRimeline((prevSlides) =>
        prevSlides.map((slide) => {
          if (slide.index === selectedSvgIndex) {
            // Log the animation assignment
            setActivityLog((prevLog) => [
              ...prevLog,
              { type: "assignAnimation", slideIndex: selectedSvgIndex, animationType: HANDSTAND },
            ]);
            return {
              ...slide,
              animationType: slide.animationType === HANDSTAND ? null : HANDSTAND,
              duration: ANIMATION_TIME_LINE,
            };
          }
          return slide;
        })
      );
    }
  };







  const replayActivities = () => {
    const canvas = svgContainerRef.current;
    if (!(canvas instanceof HTMLCanvasElement)) {
      console.warn("Canvas not found or is not a valid HTMLCanvasElement.");
      return;
    }
  
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas context not available.");
      return;
    }
  
    const filteredSlides = slideForTimeline.filter((slide) => slide.animationType);
  
    if (filteredSlides.length === 0) {
      console.warn("No animations assigned for replay.");
      return;
    }
  
    console.log("Starting replay and recording...");
    startRecording(); // Start recording
  
    const totalDuration = filteredSlides.reduce((sum, slide) => sum + slide.duration, 0);
    let elapsedTime = draggedSeconds !== null ? draggedSeconds * 1000 : 0;
    let currentIndex = 0;
  
    if (draggedSeconds !== null) {
      currentIndex = filteredSlides.findIndex((slide, index) => {
        const start = filteredSlides.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
        const end = start + slide.duration;
        return elapsedTime >= start && elapsedTime < end;
      });
      currentIndex = Math.max(0, currentIndex);
    }
  
    const playheadElement = document.querySelector(".playhead");
  
    const updatePlayhead = (currentElapsed:number) => {
      const progress = Math.min((currentElapsed / totalDuration) * 100, 100);
      if (playheadElement instanceof HTMLElement) {
        playheadElement.style.left = `${progress}%`;
      }
      console.log(`Playhead updated to: ${progress.toFixed(2)}%`);
    };
  
    const drawBackground = () => {
      if (backgroundImage) {
        const bgImg = new Image();
        bgImg.src = backgroundImage;
  
        bgImg.onload = () => {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          console.log("Background image drawn successfully.");
        };
  
        bgImg.onerror = () => {
          console.error("Failed to load background image.");
        };
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log("Default white background drawn.");
      }
    };
  
    const replayStep = (index:number) => {
      if (index >= filteredSlides.length) {
        setCurrentReplayIndex(null);
        stopRecording();
        console.log("Replay completed.");
  
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            downloadVideo();
            console.log("Recording stopped and video downloaded.");
          };
        }
        return;
      }
  
      const slide = filteredSlides[index];
      setCurrentReplayIndex(slide.index);
  
      console.log(`Replaying Slide ${index + 1}/${filteredSlides.length}: Type - ${slide.animationType}, Duration - ${slide.duration}ms`);
  
      const slideElements = document.querySelectorAll(".svg-container-for-timeline .timeline-wrapper");
      slideElements.forEach((el, idx) => {
        if (el instanceof HTMLElement) {
          el.classList.toggle("red-border", idx === slide.index);
        }
      });
  
      const img = new Image();
      const svgBlob = new Blob([slide.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
  
      img.onload = () => {
        drawBackground();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        console.log(`SVG image for Slide ${index + 1} drawn successfully.`);
  
        if (slide.animationType === WALKING) {
          wlkingAnimationPlay(slide.svg);
          console.log("Walking animation triggered.");
        } else if (slide.animationType === HANDSTAND) {
          handStandanimationPlay(slide.svg);
          console.log("Handstand animation triggered.");
        }
  
        const animationStartTime = Date.now();
        const animationEndTime = animationStartTime + slide.duration;
  
        const interval = setInterval(() => {
          const now = Date.now();
          elapsedTime += 1000;
          updatePlayhead(elapsedTime);
  
          if (now >= animationEndTime) {
            clearInterval(interval);
            console.log(`Slide ${index + 1} completed.`);
            replayStep(index + 1);
          }
        }, 1000);
      };
  
      img.onerror = () => {
        console.error(`Error loading SVG image for Slide ${index + 1}. Skipping to the next slide.`);
        replayStep(index + 1);
      };
  
      img.src = url;
    };
  
    drawBackground();
    replayStep(currentIndex);
  };
  





  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const timelineElement = e.currentTarget;
    const rect = timelineElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    const timelineWidth = rect.width;
    const totalDurationInSeconds = slideForTimeline
      .filter((slide) => slide.animationType)
      .reduce((sum, slide) => sum + slide.duration, 0) / 1000;

    // Adjust for the width of the playhead circle (20px)
    const playheadRadius = 10; // Half of the circle's width
    const adjustedOffsetX = Math.max(0, Math.min(offsetX, timelineWidth)); // Ensure within bounds

    const newSeconds = Math.max(
      0,
      Math.min(((adjustedOffsetX - playheadRadius) / (timelineWidth - 2 * playheadRadius)) * totalDurationInSeconds, totalDurationInSeconds)
    );

    // Update dragged position and playhead position without triggering other updates
    if (draggedSeconds !== newSeconds) {
      setDraggedSeconds(newSeconds);
      setPlayheadPosition((newSeconds / totalDurationInSeconds) * 100);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };


  return (
    <>



      <div className="container">
        <div className="frame-container">
          <div className="left-side">
            <h1 className="main-heading">Upload</h1>
            <div className="choose_file-container">
              <label htmlFor="file-upload" className="custom-file-upload">
                Upload SVGs
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".svg"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </div>
            <div className="choose_file-container">
              <label htmlFor="background-upload" className="custom-file-upload">
                Upload Background
              </label>
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
            </div>

        
            <div className="svg-thumb-container">
              {svgDataList.length > 0 ? (
                svgDataList.map((svg, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      height: "200px",
                      border: "1px solid #ccc",
                      marginBottom: "50px",
                      cursor: "pointer",
                    }}
                    className={selectedSvgIndex === index ? "active" : ""}
                  >
                    <div
                      onClick={() => handleSvgClick(svg, index)}
                      dangerouslySetInnerHTML={{ __html: svg }}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />


                    <div className="add-and-delete-buttons">
                      <button
                        onClick={(event) => addSlideToTimeline(event)}
                        data-index={index} // Pass the index dynamically
                        style={{
                          padding: "12px 10px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          width: "50%",
                        }}
                      >
                        Add Slide
                      </button>

                      <button
                        onClick={() => handleDeleteSvg()} // Delete SVG
                        style={{
                          padding: "12px 10px",
                          backgroundColor: "#f44336", // Red for "Delete"
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          width: "50%"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No SVGs uploaded yet.</p>
              )}
            </div>
            <div className="layers-prev-container">
              <h1 className="main-heading">Animations</h1>
              <div className="layersOuter">

                <Animations addAnimation={addAnimation} handleWalkingAnimation={handleWalkingAnimation} handlehandstandAnimation={handlehandstandAnimation} />
              </div>
            </div>
          </div>
          <div className="right-side">
            <Preview
              setSvgDataList={setSvgDataList}
              selectedSvg={selectedSvg}
              backgroundImage={backgroundImage}
              svgContainerRef={svgContainerRef}


              setBackgroundImage={setBackgroundImage}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              selectedLayers={selectedLayers}

              slideForTimeline={slideForTimeline}

              handleSvgClick={handleSvgClick}


              currentReplayIndex={currentReplayIndex}
              svgPosition={svgPosition}
              setSvgPosition={setSvgPosition}
              replayActivities={replayActivities}
            
              playheadPosition={playheadPosition}

              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              playPauseAni={handlePlayPauseForSelectedSlide}



            />

          </div>
          <div className="leayrs-container">
            <Layers selectedSvg={selectedSvg}
              parseSvgLayers={parseSvgLayers}
              selectedLayers={selectedLayers}
              handleLayerClick={handleLayerClick}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;