import { useCallback, useState } from 'react';

export interface GeolocationCoords {
  lat: number;
  lng: number;
}

export type GeolocationErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'unavailable'
  | 'timeout'
  | 'unknown';

export interface GeolocationError {
  code: GeolocationErrorCode;
  message: string;
}

interface RequestOptions {
  timeoutMs?: number;
  maximumAgeMs?: number;
  enableHighAccuracy?: boolean;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes — reuse a recent fix if available

const errorMessages: Record<GeolocationErrorCode, string> = {
  unsupported: 'Your browser does not support location services.',
  'permission-denied':
    'Location access was denied. You can enable it from your browser settings and try again.',
  unavailable: 'We could not determine your location right now. Please try again in a moment.',
  timeout: 'Locating you took too long. Please try again.',
  unknown: 'Something went wrong while requesting your location.',
};

const mapBrowserError = (error: GeolocationPositionError): GeolocationError => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return { code: 'permission-denied', message: errorMessages['permission-denied'] };
    case error.POSITION_UNAVAILABLE:
      return { code: 'unavailable', message: errorMessages.unavailable };
    case error.TIMEOUT:
      return { code: 'timeout', message: errorMessages.timeout };
    default:
      return { code: 'unknown', message: error.message || errorMessages.unknown };
  }
};

/**
 * Wraps `navigator.geolocation.getCurrentPosition` with React-friendly
 * loading/error state plus an imperative `request` function. The hook does
 * NOT trigger a prompt on mount — the caller decides when to ask.
 */
export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);

  const request = useCallback((options: RequestOptions = {}): Promise<GeolocationCoords> => {
    const {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      maximumAgeMs = DEFAULT_MAX_AGE_MS,
      enableHighAccuracy = false,
    } = options;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err: GeolocationError = { code: 'unsupported', message: errorMessages.unsupported };
      setError(err);
      return Promise.reject(err);
    }

    setIsLoading(true);
    setError(null);

    return new Promise<GeolocationCoords>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          const coords: GeolocationCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(coords);
        },
        (browserError) => {
          setIsLoading(false);
          const mapped = mapBrowserError(browserError);
          setError(mapped);
          reject(mapped);
        },
        {
          enableHighAccuracy,
          timeout: timeoutMs,
          maximumAge: maximumAgeMs,
        },
      );
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { request, clearError, isLoading, error };
};
