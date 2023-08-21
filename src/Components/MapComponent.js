import axios from "axios";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useRef, useState } from "react";
import "./MapComponent.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZ2VyYWxkb2FheCIsImEiOiJjbGxqcHNua20xc2kwM3JxbGEzcTlxejV1In0._TjtERCCw3jI5kjV6S4qIw";

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/convert")
      .then((response) => {
        console.log("Fetched data:", response.data); // Log the fetched data
        setCoordinates(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    if (coordinates.length === 0) return;

    console.log("Coordinates for heatmap:", coordinates); // Log the coordinates

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: coordinates[0].coordinates,
      zoom: 9,
    });

    map.on("load", () => {
      const geojsonData = {
        type: "FeatureCollection",
        features: coordinates.map((coord) => ({
          type: "Feature",
          properties: { signal: coord.signal },
          geometry: {
            type: "Point",
            coordinates: coord.coordinates,
          },
        })),
      };

      console.log("GeoJSON data for heatmap:", geojsonData); // Log the GeoJSON data

      map.addSource("heatmap-source", {
        type: "geojson",
        data: geojsonData,
      });

      map.addLayer({
        id: "heatmap",
        type: "heatmap",
        source: "heatmap-source",
        // ... rest of the heatmap properties ...
      });
    });

    return () => map.remove();
  }, [coordinates]);

  const Legend = () => (
    <div className="legend">
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "rgb(178,24,43)" }}
        ></div>
        Strong Signal
      </div>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "rgb(239,138,98)" }}
        ></div>
        Moderate Signal
      </div>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "rgb(253,219,199)" }}
        ></div>
        Weak Signal
      </div>
    </div>
  );

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "600px" }} />
      <Legend />
    </div>
  );
};

export default MapComponent;
