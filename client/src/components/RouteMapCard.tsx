import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, ExternalLink, MapPin, Route as RouteIcon } from "lucide-react";
import { MapView } from "@/components/Map";
import { buildDirectionsUrl } from "@shared/routeRequest";

type RouteMapCardProps = {
  origin?: string;
  destination: string;
  language?: "AR" | "TR" | "EN";
};

type RouteSummary = { distance: string; duration: string };

export function RouteMapCard({ origin, destination, language = "AR" }: RouteMapCardProps) {
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const labels = useMemo(() => {
    if (language === "TR") return { loading: "Rota haritada hazırlanıyor…", distance: "Mesafe", duration: "Süre", open: "Google Maps'te aç", error: "Rota oluşturulamadı. Resmî Google Maps yönlendirmesini açabilirsiniz." };
    if (language === "EN") return { loading: "Preparing the route on the map…", distance: "Distance", duration: "Time", open: "Open in Google Maps", error: "The route could not be drawn. You can open the official Google Maps directions." };
    return { loading: "أرسم الطريق على الخريطة…", distance: "المسافة", duration: "المدة", open: "فتح الاتجاهات في Google Maps", error: "تعذر رسم الطريق على الخريطة. يمكنك فتح الاتجاهات الرسمية في Google Maps." };
  }, [language]);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setError(null);
    const timeout = window.setTimeout(() => {
      if (!window.google?.maps) {
        setError(labels.error);
        return;
      }
      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({ suppressMarkers: false, preserveViewport: false });
      rendererRef.current = renderer;
      if (mapRef.current) renderer.setMap(mapRef.current);
      service.route(
        {
          origin: origin || "Trabzon, Türkiye",
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        },
        (result, status) => {
          if (cancelled) return;
          if (status !== "OK" || !result) {
            setError(labels.error);
            return;
          }
          renderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          setSummary(leg?.distance && leg?.duration ? { distance: leg.distance.text, duration: leg.duration.text } : null);
        },
      );
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
      mapRef.current = null;
    };
  }, [destination, labels.error, origin]);

  return (
    <div className="route-map-card" dir={language === "AR" ? "rtl" : "ltr"}>
      <div className="route-map-heading">
        <span className="route-map-icon"><RouteIcon size={16} /></span>
        <div><strong>{destination}</strong><small>{origin ? `${origin} ← ${destination}` : destination}</small></div>
      </div>
      <div className="route-map-canvas">
        <MapView initialCenter={{ lat: 40.99, lng: 39.72 }} initialZoom={8} onMapReady={(map) => { mapRef.current = map; rendererRef.current?.setMap(map); }} />
        {!summary && !error && <div className="route-map-overlay"><MapPin size={17} /> {labels.loading}</div>}
        {error && <div className="route-map-overlay route-map-error"><MapPin size={17} /> {error}</div>}
      </div>
      {summary && <div className="route-map-summary"><span><MapPin size={14} /> <b>{labels.distance}</b> {summary.distance}</span><span><Clock3 size={14} /> <b>{labels.duration}</b> {summary.duration}</span></div>}
      <a className="route-map-open" href={buildDirectionsUrl(origin, destination)} target="_blank" rel="noreferrer"><ExternalLink size={14} /> {labels.open}</a>
    </div>
  );
}
