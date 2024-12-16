import React from "react";

interface Layer {
  id: string;
  children: Array<{ id?: string }>;
}

interface PreviewProps {
  selectedSvg: string | null; // The SVG can be a string or null
  parseSvgLayers: (svg: string) => Layer[]; // Function that takes an SVG string and returns an array of Layer objects
  selectedLayers: string[]; // Array of selected layer IDs
  handleLayerClick: (layerId: string) => void; // Function that handles layer click by layer ID
}

const Layers: React.FC<PreviewProps> = ({
  selectedSvg,
  parseSvgLayers,
  selectedLayers,
  handleLayerClick,
}) => {
  return (
    <div className="layers-container">
      <h1>Layers</h1>
      <ul>
        {selectedSvg &&
          parseSvgLayers(selectedSvg).map((layer) => (
            <li key={layer.id}>
              {/* Main Layer */}
              <button
                onClick={() => handleLayerClick(layer.id)}
                style={{
                  background: selectedLayers.includes(layer.id)
                    ? "#f49a03e0"
                    : "#f57622"
                }}
              >
                {layer.id}
              </button>

              {/* Children */}
              {/* {layer.children.length > 0 && (
                <ul style={{ paddingLeft: "16px" }}>
                  {layer.children.map((child, childIndex) => (
                    <li key={`${layer.id}-child-${childIndex}`}>
                      <button
                        onClick={() =>
                          handleLayerClick(
                            child.id || `${layer.id}-child-${childIndex}`
                          )
                        }
                        style={{
                          background: selectedLayers.includes(
                            child.id || `${layer.id}-child-${childIndex}`
                          )
                            ? "lightcoral"
                            : "transparent",
                          padding: "8px",
                          cursor: "pointer",
                          margin: "4px 0",
                          width: "100%",
                          color: "red", // Children in red
                        }}
                      >
                        {child.id || `Child ${childIndex}`}
                      </button>
                    </li>
                  ))}
                </ul>
              )} */}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Layers;
