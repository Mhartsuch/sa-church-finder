import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import MapGL, {
  GeolocateControl,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ViewStateChangeEvent,
} from 'react-map-gl';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_RADIUS } from '@/constants';
import { useChurches } from '@/hooks/useChurches';
import { loadMapboxGl } from '@/lib/load-mapbox-gl';
import { useSearchStore } from '@/stores/search-store';
import { IChurchSummary } from '@/types/church';
import { formatDistance, formatRating, getNextService } from '@/utils/format';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const mapboxGlPromise = loadMapboxGl() as NonNullable<ComponentProps<typeof MapGL>['mapLib']>;

const getShortLabel = (name: string) => {
  const stripped = name
    .replace(/\b(Church|Cathedral|Mission|Episcopal|Baptist|Methodist|Saint|St\.?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const words = (stripped || name).split(' ').filter(Boolean);
  return words.slice(0, 2).join(' ');
};

export const InteractiveMap = () => {
  const mapRef = useRef<MapRef>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const mapCenter = useSearchStore((state) => state.mapCenter);
  const mapZoom = useSearchStore((state) => state.mapZoom);
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId);
  const selectedChurchId = useSearchStore((state) => state.selectedChurchId);
  const mapBounds = useSearchStore((state) => state.mapBounds);

  const setMapCenter = useSearchStore((state) => state.setMapCenter);
  const setMapZoom = useSearchStore((state) => state.setMapZoom);
  const setMapBounds = useSearchStore((state) => state.setMapBounds);
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch);
  const setSelectedChurch = useSearchStore((state) => state.setSelectedChurch);

  const [popupChurch, setPopupChurch] = useState<IChurchSummary | null>(null);

  const boundsString = mapBounds
    ? `${mapBounds.swLat},${mapBounds.swLng},${mapBounds.neLat},${mapBounds.neLng}`
    : undefined;

  const searchParams = {
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: DEFAULT_RADIUS,
    q: query || undefined,
    denomination: filters.denomination,
    day: filters.day,
    time: filters.time,
    language: filters.language,
    amenities: filters.amenities,
    sort,
    page: 1,
    pageSize: 200,
    bounds: boundsString,
  };

  const { data } = useChurches(searchParams);
  const churches = useMemo(() => data?.data || [], [data]);

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (popupChurch && !churches.some((church) => church.id === popupChurch.id)) {
      setPopupChurch(null);
      setSelectedChurch(null);
    }
  }, [churches, popupChurch, setSelectedChurch]);

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom } = event.viewState;
      setMapCenter(latitude, longitude);
      setMapZoom(zoom);

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(() => {
        const map = mapRef.current?.getMap();
        if (!map) {
          return;
        }

        const bounds = map.getBounds();
        if (!bounds) {
          return;
        }

        setMapBounds({
          swLat: bounds.getSouthWest().lat,
          swLng: bounds.getSouthWest().lng,
          neLat: bounds.getNorthEast().lat,
          neLng: bounds.getNorthEast().lng,
        });
      }, 300);
    },
    [setMapBounds, setMapCenter, setMapZoom],
  );

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return;
    }

    const bounds = map.getBounds();
    if (!bounds) {
      return;
    }

    setMapBounds({
      swLat: bounds.getSouthWest().lat,
      swLng: bounds.getSouthWest().lng,
      neLat: bounds.getNorthEast().lat,
      neLng: bounds.getNorthEast().lng,
    });
  }, [setMapBounds]);

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        initialViewState={{
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          zoom: mapZoom,
        }}
        mapLib={mapboxGlPromise}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        onClick={() => {
          setPopupChurch(null);
          setSelectedChurch(null);
        }}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" trackUserLocation={false} />

        {churches.map((church) => {
          const isActive = church.id === hoveredChurchId || church.id === selectedChurchId;
          const markerLabel =
            church.avgRating > 0 ? formatRating(church.avgRating) : getShortLabel(church.name);

          return (
            <Marker
              key={church.id}
              longitude={church.longitude}
              latitude={church.latitude}
              anchor="bottom"
            >
              <button
                type="button"
                onMouseEnter={() => setHoveredChurch(church.id)}
                onMouseLeave={() => setHoveredChurch(null)}
                onFocus={() => setHoveredChurch(church.id)}
                onBlur={() => setHoveredChurch(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedChurch(church.id);
                  setPopupChurch(church);
                }}
                className={`inline-flex min-w-[54px] items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform ${
                  isActive
                    ? 'scale-105 border-[#111111] text-[#111111]'
                    : 'border-[#4b5563] text-[#111111]'
                }`}
                aria-label={`Open ${church.name} on the map`}
              >
                {church.avgRating > 0 ? (
                  <Star className="h-3 w-3 fill-[#d90b45] text-[#d90b45]" />
                ) : null}
                <span>{markerLabel}</span>
              </button>
            </Marker>
          );
        })}

        {popupChurch && (
          <Popup
            longitude={popupChurch.longitude}
            latitude={popupChurch.latitude}
            anchor="bottom"
            onClose={() => {
              setPopupChurch(null);
              setSelectedChurch(null);
            }}
            closeOnClick={false}
            className="church-popup"
            maxWidth="280px"
          >
            <button
              type="button"
              className="w-full cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-2"
              onClick={() => navigate(`/churches/${popupChurch.slug}`)}
              aria-label={`View ${popupChurch.name} profile`}
            >
              <h3 className="mb-1 text-[15px] font-semibold leading-tight text-[#1a1a1a]">
                {popupChurch.name}
              </h3>
              {popupChurch.denomination && (
                <p className="mb-0.5 text-[13px] text-[#6b6560]">{popupChurch.denomination}</p>
              )}
              <div className="flex items-center gap-2 text-[13px] text-[#6b6560]">
                {popupChurch.avgRating > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1a1a1a]">
                    <Star className="h-3 w-3 fill-current" />
                    {formatRating(popupChurch.avgRating)}
                  </span>
                )}
                <span>{formatDistance(popupChurch.distance)} away</span>
              </div>
              {(() => {
                const nextService = getNextService(popupChurch.services);
                return nextService ? (
                  <p className="mt-1 text-[13px] font-semibold text-[#1a1a1a]">{nextService}</p>
                ) : null;
              })()}
              <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#d90b45]">
                View profile
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </Popup>
        )}
      </MapGL>
    </div>
  );
};
