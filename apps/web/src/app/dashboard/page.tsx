"use client";

import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
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
  const [hovered, setHovered] = useState<any>(null);

  // default center Jakarta
  const defaultCenter = { lat: -6.2221431, lng: 106.9179941 };

  // fallback locations jika kosong
  const locations =
    fetchedLocations && fetchedLocations.length > 0
      ? fetchedLocations
      : [
          {
            id: "1",
            lat: -6.200000,
            lng: 106.816666,
            address_name: "Jakarta Pusat",
            detail_address: "Jl. Medan Merdeka Barat No.12, Jakarta Pusat",
            segment: "Segmen A",
            device_id: "DEV-001",
            isActive: true,
          },
          {
            id: "2",
            lat: -6.914744,
            lng: 107.609810,
            address_name: "Bandung",
            detail_address: "Jl. Asia Afrika No.45, Bandung",
            segment: "Segmen B",
            device_id: "DEV-002",
            isActive: false,
          },
        ];

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (locations.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((loc) => {
          bounds.extend({ lat: loc.lat, lng: loc.lng });
        });
        map.fitBounds(bounds);
      } else if (locations.length === 1) {
        const single = locations[0];
        map.setCenter({ lat: single.lat, lng: single.lng });
        map.setZoom(14);
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
              // Hover → tampilkan InfoWindow
              onMouseOver={() => setHovered(loc)}
              onMouseOut={() => setHovered(null)}
              icon={{
                url: loc.isActive ? "/active.svg" : "/nonactive.svg",
                scaledSize: new google.maps.Size(zoom * 5, zoom * 5),
                anchor: new google.maps.Point((zoom * 4) / 2, (zoom * 4) / 2),
              }}
            >
              {hovered && hovered.id === loc.id && (
                <InfoWindow
                  position={{ lat: loc.lat, lng: loc.lng }}
                  options={{ disableAutoPan: false}} 
                >
                  <div className="text-[12px] ">
                    <strong className="text-blue-700">
                      <p className="truncate max-w-[190px] mb-2" title={loc.detail_address}>
                        📍 {loc.address_name}
                      </p>
                    </strong>
                    <p className="text-gray-800 ">Device ID     : {loc.device_id || "-"}</p>
                    <p className="text-gray-800 ">Detail Address: {loc.detail_address || "-"}</p>
                    <p className="text-gray-800 ">Segment       : {loc.segment || "-"}</p>
                    <p className="text-gray-800 ">
                      Status:{" "}
                      <span
                        className={loc.isActive ? "text-green-600" : "text-red-600"}
                      >
                        {loc.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}
