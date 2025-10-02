"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { useSiteMonitoring } from "./useSiteMonitoring";

export default function SiteMonitoring() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });


  const userId = "123";
  const token = "user-jwt-token";

  const { locations: fetchedLocations } = useSiteMonitoring(userId, token);
  const [zoom, setZoom] = useState(15);

  // default center Jakarta
  const defaultCenter = { lat: -6.2221431, lng: 106.9179941 };

  // fallback locations jika fetchedLocations kosong
  const locations =
    fetchedLocations && fetchedLocations.length > 0 ? fetchedLocations : [
      {
            id: "default-1",
            lat:  -6.295082155524223,
            lng: 106.94845277753198,
            address_name: "Jakarta (Default Location)",
            isActive: false,
          },
    ];

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (locations.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((loc) => {
          bounds.extend({ lat: loc.lat, lng: loc.lng });
        });
        map.fitBounds(bounds); // auto-center sekali saat load
      } else {
        map.setCenter(defaultCenter);
        map.setZoom(10);
      }

      map.addListener("zoom_changed", () => {
        setZoom(map.getZoom() || 15);
      });
    },
    [locations]
  );

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
      <div
        className="w-full h-full shadow-lg overflow-hidden"
        style={{ height: "86.5vh" }}
      >
        <GoogleMap
          mapContainerStyle={{ width: "76vw", height: "100%" }}
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
