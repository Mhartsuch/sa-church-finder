import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

import { NearMeButton } from './NearMeButton';

const addToast = vi.fn();

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ addToast, toasts: [], dismissToast: vi.fn() }),
}));

type SuccessCallback = (position: GeolocationPosition) => void;
type ErrorCallback = (error: GeolocationPositionError) => void;

const buildPosition = (lat: number, lng: number): GeolocationPosition =>
  ({
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }) as GeolocationPosition;

const renderButton = () => render(<NearMeButton />);

describe('NearMeButton', () => {
  let originalGeolocation: Geolocation | undefined;
  let getCurrentPosition: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addToast.mockReset();
    useSearchStore.setState({
      query: '',
      filters: {},
      sort: 'rating',
      page: 1,
      hoveredChurchId: null,
      selectedChurchId: null,
      mapCenter: SA_CENTER,
      mapZoom: DEFAULT_ZOOM,
      mapBounds: null,
      userLocation: null,
    });

    getCurrentPosition = vi.fn();
    originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it('activates user location and switches sort to distance', async () => {
    getCurrentPosition.mockImplementation((success: SuccessCallback) => {
      success(buildPosition(29.6, -98.5));
    });

    renderButton();

    fireEvent.click(screen.getByRole('button', { name: /find churches near me/i }));

    await waitFor(() => {
      expect(useSearchStore.getState().userLocation).toEqual({ lat: 29.6, lng: -98.5 });
    });
    expect(useSearchStore.getState().sort).toBe('distance');
  });

  it('renders the cleared-state affordance once a location is active', async () => {
    useSearchStore.getState().setUserLocation({ lat: 29.6, lng: -98.5 });

    renderButton();

    expect(screen.getByText('Near you')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear 'near you' location/i }));

    expect(useSearchStore.getState().userLocation).toBeNull();
  });

  it('dispatches an error toast when the browser denies the request', async () => {
    getCurrentPosition.mockImplementation((_success: SuccessCallback, errorCb: ErrorCallback) => {
      errorCb({
        code: 1,
        message: 'denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });

    renderButton();

    fireEvent.click(screen.getByRole('button', { name: /find churches near me/i }));

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
          message: expect.stringMatching(/location access was denied/i),
        }),
      );
    });
    expect(useSearchStore.getState().userLocation).toBeNull();
  });
});
