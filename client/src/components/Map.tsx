/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * The Manus proxy provides Google Maps access without requiring the visitor to
 * enter an API key. This component owns script loading and exposes the ready
 * map instance to the parent for markers, routes, and places.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;
let mapsScriptPromise: Promise<void> | null = null;

function loadMapScript(): Promise<void> {
  if (typeof window !== "undefined" && window.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry,routes`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.google?.maps) {
        resolve();
      } else {
        mapsScriptPromise = null;
        reject(new Error("Google Maps loaded without its API namespace"));
      }
      script.remove();
    };
    script.onerror = () => {
      mapsScriptPromise = null;
      script.remove();
      reject(new Error("Failed to load Google Maps through the Manus proxy"));
    };
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const init = usePersistFn(async () => {
    try {
      setMapError(false);
      await loadMapScript();
      if (!mapContainer.current || !window.google?.maps) {
        throw new Error("Map container or Google Maps API is unavailable");
      }
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        mapId: "DEMO_MAP_ID",
      });
      onMapReady?.(map.current);
    } catch (error) {
      console.error("Interactive map could not be initialized", error);
      setMapError(true);
    }
  });

  useEffect(() => {
    void init();
  }, [init, retryToken]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)}>
      {mapError && (
        <div className="map-fallback" role="status" aria-live="polite">
          <div className="map-fallback-grid" aria-hidden="true" />
          <span className="map-fallback-kicker">ALASSAUL / NORTH TURKEY</span>
          <strong>خريطة الشمال التركي</strong>
          <p>يمكنك اختيار المدينة والوجهة من القائمة، أو إعادة تحميل الخريطة التفاعلية.</p>
          <button type="button" onClick={() => { mapsScriptPromise = null; setRetryToken((value) => value + 1); }}>
            إعادة تحميل الخريطة
          </button>
        </div>
      )}
    </div>
  );
}
