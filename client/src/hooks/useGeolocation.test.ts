import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGeolocation } from './useGeolocation';

type SuccessCallback = (position: GeolocationPosition) => void;
type ErrorCallback = (error: GeolocationPositionError) => void;

interface MockGeolocation {
  getCurrentPosition: ReturnType<typeof vi.fn>;
}

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

const buildError = (code: number, message = 'failed'): GeolocationPositionError => ({
  code,
  message,
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
});

describe('useGeolocation', () => {
  let originalGeolocation: Geolocation | undefined;
  let mockGeolocation: MockGeolocation;

  beforeEach(() => {
    mockGeolocation = { getCurrentPosition: vi.fn() };
    originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it('resolves with coordinates and flips loading state', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success: SuccessCallback) => {
      success(buildPosition(29.51, -98.42));
    });

    const { result } = renderHook(() => useGeolocation());

    let coords: { lat: number; lng: number } | undefined;
    await act(async () => {
      coords = await result.current.request();
    });

    expect(coords).toEqual({ lat: 29.51, lng: -98.42 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a permission-denied error with an actionable message', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: SuccessCallback, errorCb: ErrorCallback) => {
        errorCb(buildError(1, 'denied'));
      },
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await expect(result.current.request()).rejects.toMatchObject({
        code: 'permission-denied',
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.code).toBe('permission-denied');
    expect(result.current.error?.message).toMatch(/location access was denied/i);
  });

  it('maps the timeout error code', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: SuccessCallback, errorCb: ErrorCallback) => {
        errorCb(buildError(3));
      },
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await expect(result.current.request()).rejects.toMatchObject({ code: 'timeout' });
    });

    expect(result.current.error?.code).toBe('timeout');
  });

  it('reports an unsupported error when the browser has no geolocation API', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await expect(result.current.request()).rejects.toMatchObject({ code: 'unsupported' });
    });

    expect(result.current.error?.code).toBe('unsupported');
  });

  it('clearError resets any stored error', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: SuccessCallback, errorCb: ErrorCallback) => {
        errorCb(buildError(1));
      },
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await expect(result.current.request()).rejects.toBeTruthy();
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
