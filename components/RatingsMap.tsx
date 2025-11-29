'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default marker icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Rating {
  id: string
  lat: number
  lng: number
  decorations: number
  candy: number
  timestamp: string
}

interface RatingsMapProps {
  center: [number, number]
  ratings: Rating[]
}

export default function RatingsMap({ center, ratings }: RatingsMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Loading map...</p>
      </div>
    )
  }

  // Create custom markers based on rating quality
  const getMarkerColor = (decorations: number, candy: number) => {
    const avg = (decorations + candy) / 2
    if (avg >= 8) return '#22c55e' // green
    if (avg >= 6) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ratings.map((rating) => {
          const color = getMarkerColor(rating.decorations, rating.candy)
          const customIcon = new L.DivIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          return (
            <Marker key={rating.id} position={[rating.lat, rating.lng]} icon={customIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-2">House Rating</p>
                  <div className="space-y-1">
                    <p>Decorations: {rating.decorations}/10</p>
                    <p>Candy: {rating.candy}/10</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(rating.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
