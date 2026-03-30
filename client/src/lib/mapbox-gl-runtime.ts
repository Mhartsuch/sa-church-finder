// `react-map-gl` falls back to dynamically importing `mapbox-gl` when no `mapLib`
// prop is provided. We always pass our own runtime loader, so this stub keeps Vite
// from bundling the real package into a giant lazy chunk.
const unavailableMapboxGl = null

export default unavailableMapboxGl
