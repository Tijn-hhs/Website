import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Neighborhood, UniversityLocation } from '../lib/neighborhoodConfig'
import type { LatLngBoundsExpression } from 'leaflet'

// Add styles to prevent map from blocking interactions
const mapStyles = `
  .neighborhood-map-container .leaflet-pane {
    z-index: auto !important;
  }
  .neighborhood-map-container .leaflet-pane.leaflet-overlay-pane {
    z-index: 400 !important;
  }
  .neighborhood-map-container .leaflet-popup {
    z-index: 600 !important;
  }
`

interface NeighborhoodMapProps {
  neighborhoods: Neighborhood[]
  universityLocation: UniversityLocation | null
  highlightedNeighborhoodId?: string
}

// Create custom icons
const universityIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiMxZTQwYWYiIHJ4PSI1Ii8+PHRleHQgeD0iNiIgeT0iMTgiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSI+VTwvdGV4dD48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const neighborhoodIcon = (isHighlighted: boolean) => new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${isHighlighted ? '%231e40af' : '%0f172a'}" opacity="${isHighlighted ? '1' : '0.6'}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`
  )}`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

export default function NeighborhoodMap({
  neighborhoods,
  universityLocation,
  highlightedNeighborhoodId,
}: NeighborhoodMapProps) {
  if (!universityLocation) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
        <p className="text-slate-600">Unable to display map - university location not found.</p>
      </div>
    )
  }

  // Calculate bounds to fit all markers
  const allLocations = [universityLocation, ...neighborhoods]
  const latLngs: LatLngBoundsExpression = allLocations.map((loc) => [loc.lat, loc.lng])
  const bounds = L.latLngBounds(latLngs as L.LatLngTuple[])

  return (
    <>
      <style>{mapStyles}</style>
      <div className="neighborhood-map-container rounded-lg overflow-hidden border border-slate-200 shadow-sm" style={{ position: 'relative', zIndex: 10 }}>
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [50, 50] }}
          style={{ height: '500px', width: '100%', position: 'relative', zIndex: 0 }}
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* University Marker */}
        <Marker position={[universityLocation.lat, universityLocation.lng]} icon={universityIcon as any}>
          <Popup>
            <div className="font-semibold text-slate-900 text-sm">{universityLocation.name}</div>
          </Popup>
        </Marker>

        {/* Neighborhood Markers */}
        {neighborhoods.map((neighborhood) => (
          <div key={neighborhood.id}>
            <Marker
              position={[neighborhood.lat, neighborhood.lng]}
              icon={neighborhoodIcon(highlightedNeighborhoodId === neighborhood.id) as any}
            >
              <Popup>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-slate-900">{neighborhood.name}</div>
                  <div className="text-xs text-slate-600">{neighborhood.description}</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {neighborhood.avgRent}
                    </span>
                    <span>🚶 {neighborhood.walkabilityScore}/10</span>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Visual radius circles for walkability */}
            <Circle
              center={[neighborhood.lat, neighborhood.lng] as L.LatLngExpression}
              radius={300 + neighborhood.walkabilityScore * 100}
              pathOptions={{
                color: highlightedNeighborhoodId === neighborhood.id ? '#1e40af' : '#e0e7ff',
                fillColor: highlightedNeighborhoodId === neighborhood.id ? '#dbeafe' : '#f3f4f6',
                fillOpacity: 0.15,
                weight: highlightedNeighborhoodId === neighborhood.id ? 2 : 1,
              }}
            />
          </div>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="bg-white px-6 py-4 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: '#1e40af' }}
            ></div>
            <span className="text-slate-600">University</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#0f172a' }}
            ></div>
            <span className="text-slate-600">Neighborhoods</span>
          </div>
          <div className="col-span-2 text-slate-600">
            💡 Circle size = higher walkability score
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
