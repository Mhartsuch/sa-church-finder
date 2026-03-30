const MAPBOX_GL_VERSION = 'v3.20.0'
const MAPBOX_GL_SCRIPT_ID = 'mapbox-gl-runtime-script'
const MAPBOX_GL_STYLESHEET_ID = 'mapbox-gl-runtime-stylesheet'
const MAPBOX_GL_SCRIPT_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.js`
const MAPBOX_GL_STYLESHEET_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.css`

type MapboxGlGlobal = {
  Map: {
    new (options: unknown): unknown
  }
  Marker: {
    new (...options: unknown[]): unknown
  }
  Popup: {
    new (options: unknown): unknown
  }
  AttributionControl: {
    new (options: unknown): unknown
  }
  FullscreenControl: {
    new (options: unknown): unknown
  }
  GeolocateControl: {
    new (options: unknown): unknown
  }
  NavigationControl: {
    new (options: unknown): unknown
  }
  ScaleControl: {
    new (options: unknown): unknown
  }
  supported?: (options?: unknown) => boolean
}

type WindowWithMapboxGl = Window & {
  mapboxgl?: MapboxGlGlobal
}

let mapboxGlPromise: Promise<MapboxGlGlobal> | null = null

const getBrowserWindow = (): WindowWithMapboxGl => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Mapbox GL can only be loaded in the browser')
  }

  return window as unknown as WindowWithMapboxGl
}

const ensureStylesheet = (doc: Document) => {
  if (doc.getElementById(MAPBOX_GL_STYLESHEET_ID)) {
    return
  }

  const stylesheet = doc.createElement('link')
  stylesheet.id = MAPBOX_GL_STYLESHEET_ID
  stylesheet.rel = 'stylesheet'
  stylesheet.href = MAPBOX_GL_STYLESHEET_URL
  stylesheet.crossOrigin = 'anonymous'
  doc.head.appendChild(stylesheet)
}

const loadScript = (
  browserWindow: WindowWithMapboxGl,
  doc: Document,
): Promise<MapboxGlGlobal> =>
  new Promise((resolve, reject) => {
    const existingMapboxGl = browserWindow.mapboxgl
    if (existingMapboxGl?.Map) {
      resolve(existingMapboxGl)
      return
    }

    const existingScript = doc.getElementById(MAPBOX_GL_SCRIPT_ID)
    const script =
      existingScript instanceof HTMLScriptElement ? existingScript : doc.createElement('script')

    const handleLoad = () => {
      const mapboxGl = browserWindow.mapboxgl
      if (mapboxGl?.Map) {
        cleanup()
        resolve(mapboxGl)
        return
      }

      cleanup()
      reject(new Error('Mapbox GL loaded without exposing window.mapboxgl'))
    }

    const handleError = () => {
      cleanup()
      reject(new Error('Failed to load Mapbox GL from the Mapbox CDN'))
    }

    const cleanup = () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.id = MAPBOX_GL_SCRIPT_ID
      script.src = MAPBOX_GL_SCRIPT_URL
      script.async = true
      script.crossOrigin = 'anonymous'
      doc.head.appendChild(script)
    }
  })

export const loadMapboxGl = (): Promise<MapboxGlGlobal> => {
  if (!mapboxGlPromise) {
    const browserWindow = getBrowserWindow()
    const doc = browserWindow.document

    ensureStylesheet(doc)
    mapboxGlPromise = loadScript(browserWindow, doc).catch((error: unknown) => {
      mapboxGlPromise = null
      throw error
    })
  }

  return mapboxGlPromise
}
