"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useState, useCallback } from "react";

const locations = [
  { id: 1, lat: -7.331877, lng: 110.492196, address_name: "Lokasi 1", isActive: true },
  { id: 2, lat: -7.3335, lng: 110.4872, address_name: "Lokasi 2", isActive: false },
  { id: 3, lat: -7.329, lng: 110.495, address_name: "Lokasi 3", isActive: true },
];

const getCenter = (locs: typeof locations) => {
  const lats = locs.map((l) => l.lat);
  const lngs = locs.map((l) => l.lng);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
};

const containerStyle = { width: "100%", height: "516px" };

export default function HomePage() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // simpan center sekali saja
  const [center] = useState(getCenter(locations));
  const [zoom, setZoom] = useState(15);

  const onLoad = useCallback((map: google.maps.Map) => {
    setZoom(map.getZoom() || 15);
    map.addListener("zoom_changed", () => {
      setZoom(map.getZoom() || 15);
    });
  }, []);

  if (!isLoaded) {
    return <div className="text-white text-center mt-10">Loading Maps...</div>;
  }

  return (
    <div
      className="mx-auto my-auto max-h-screen"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <div className="w-full h-full shadow-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
        >
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              title={loc.address_name}
              icon={{
                url: loc.isActive ? "/active.svg" : "/nonactive.svg",
                scaledSize: new google.maps.Size(zoom * 4, zoom * 4),
                anchor: new google.maps.Point((zoom * 4) / 2, (zoom * 4) / 2), 
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}
