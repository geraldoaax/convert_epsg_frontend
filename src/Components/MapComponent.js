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
    if (coordinates.length === 0) {
      console.log("No coordinates provided.");
      return;
    }

    console.log("Coordinates:", coordinates);

    // Check the format of the first coordinate
    const firstCoord = coordinates[0];
    if (
      !firstCoord ||
      !Array.isArray(firstCoord.coordinates) ||
      firstCoord.coordinates.length !== 2 ||
      typeof firstCoord.signal !== "number"
    ) {
      console.error("Invalid coordinate format:", firstCoord);
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: firstCoord.coordinates,
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

      console.log("GeoJSON data:", geojsonData);

      map.addSource("heatmap-source", {
        type: "geojson",
        data: geojsonData,
      });

      map.addLayer({
        id: "heatmap",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          // ... heatmap properties ...
        },
      });
    });

    return () => map.remove();
  }, [coordinates]);

  const SignalLegend = () => (
    <div className="legend">
      <h5>Qualidade do Sinal</h5>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "rgb(178,24,43)" }}
        ></div>
        Forte ( Maior -60 dBm)
      </div>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "rgb(239,138,98)" }}
        ></div>
        Moderado (-60 a -75 dBm)
      </div>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "rgb(253,219,199)" }}
        ></div>
        Fraco ( Menor -75 dBm)
      </div>
    </div>
  );

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "600px" }} />
      <SignalLegend />
    </div>
  );
};

export default MapComponent;
