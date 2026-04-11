/**
 * Helpers for asserting responsive behavior in Vitest + jsdom.
 *
 * jsdom ships with a fixed default `innerWidth` (1024) and does not fire a
 * real `resize` event when you reassign it. These helpers mutate the DOM
 * globals and dispatch a synthetic `resize` so components that listen to
 * `window.resize` (MobileNav, SearchPage) can react in tests.
 */

export type ViewportPreset = 'mobile' | 'tablet' | 'desktop';

const PRESET_WIDTHS: Record<ViewportPreset, number> = {
  mobile: 375,
  tablet: 820,
  desktop: 1280,
};

/**
 * Set `window.innerWidth`/`innerHeight` and fire a `resize` event.
 * Returns a teardown that restores the previous dimensions so tests
 * don't leak state.
 */
export const setViewport = (
  width: number,
  height = 812,
): (() => void) => {
  const prevWidth = window.innerWidth;
  const prevHeight = window.innerHeight;

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));

  return () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: prevWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: prevHeight,
    });
    window.dispatchEvent(new Event('resize'));
  };
};

export const setViewportPreset = (preset: ViewportPreset): (() => void) =>
  setViewport(PRESET_WIDTHS[preset]);
