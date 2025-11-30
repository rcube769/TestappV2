'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Home, MapPin, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface House {
  id: string
  address: string
  latitude: number
  longitude: number
  distance?: number
}

interface HouseSelectorProps {
  onClose: () => void
  onSelectHouse: (houseAddress: string) => void
  userLocation: { lat: number; lng: number }
  existingHouses: House[]
}

export default function HouseSelector({ onClose, onSelectHouse, userLocation, existingHouses }: HouseSelectorProps) {
  const { theme, themeConfig } = useTheme()
  const [customAddress, setCustomAddress] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [nearbyHouses, setNearbyHouses] = useState<House[]>([])
  const [detectedAddresses, setDetectedAddresses] = useState<string[]>([])
  const [isDetecting, setIsDetecting] = useState(false)

  useEffect(() => {
    // Calculate distances and sort by nearest
    const housesWithDistance = existingHouses.map(house => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        house.latitude,
        house.longitude
      )
      return { ...house, distance }
    })

    // Only show houses within 500 meters
    const nearby = housesWithDistance
      .filter(h => h.distance < 500)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Show top 5 nearest

    setNearbyHouses(nearby)
  }, [existingHouses, userLocation])

  // Auto-detect multiple nearby addresses from GPS
  useEffect(() => {
    const detectAddresses = async () => {
      setIsDetecting(true)
      const addresses: string[] = []

      try {
        // Get the current exact location
        const mainResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Halloween House Rating App'
            }
          }
        )
        const mainData = await mainResponse.json()

        if (mainData.address) {
          const houseNumber = mainData.address.house_number || ''
          const road = mainData.address.road || ''

          if (houseNumber && road) {
            addresses.push(`${houseNumber} ${road}`)
          } else if (houseNumber) {
            addresses.push(houseNumber)
          }
        }

        // Get nearby addresses in a small radius (20 meters in each direction)
        const offsets = [
          { lat: 0, lng: 0.0002 },   // ~20m east
          { lat: 0, lng: -0.0002 },  // ~20m west
          { lat: 0.0002, lng: 0 },   // ~20m north
          { lat: -0.0002, lng: 0 },  // ~20m south
        ]

        for (const offset of offsets) {
          if (addresses.length >= 3) break // Limit to 3 suggestions

          try {
            const lat = userLocation.lat + offset.lat
            const lng = userLocation.lng + offset.lng

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Halloween House Rating App'
                }
              }
            )
            const data = await response.json()

            if (data.address) {
              const houseNumber = data.address.house_number || ''
              const road = data.address.road || ''

              if (houseNumber && road) {
                const address = `${houseNumber} ${road}`
                // Only add if not duplicate
                if (!addresses.includes(address)) {
                  addresses.push(address)
                }
              }
            }

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 300))
          } catch (error) {
            console.error('Error detecting nearby address:', error)
          }
        }

        setDetectedAddresses(addresses)
      } catch (error) {
        console.error('Error detecting addresses:', error)
      } finally {
        setIsDetecting(false)
      }
    }

    detectAddresses()
  }, [userLocation])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const handleCustomSubmit = () => {
    if (customAddress.trim()) {
      onSelectHouse(customAddress.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className={`border-2 ${theme === 'halloween' ? 'border-orange-200' : 'border-red-200'} shadow-2xl`}>
          <CardHeader className={`bg-gradient-to-r ${themeConfig.colors.gradient} text-white relative`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8" />
              <CardTitle className="text-2xl">Select a House</CardTitle>
            </div>
            <p className={`${theme === 'halloween' ? 'text-orange-100' : 'text-red-100'} text-sm mt-2`}>Choose which house you want to rate</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Auto-Detected Addresses */}
            {isDetecting ? (
              <div className="text-center py-4">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  <p className="text-sm text-gray-600">Detecting nearby houses...</p>
                </div>
              </div>
            ) : detectedAddresses.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Detected Nearby Houses
                </h3>
                <div className="space-y-2">
                  {detectedAddresses.map((address, idx) => (
                    <Button
                      key={idx}
                      onClick={() => onSelectHouse(address)}
                      variant={idx === 0 ? 'default' : 'outline'}
                      className={
                        idx === 0
                          ? 'w-full justify-between text-left h-auto py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0'
                          : 'w-full justify-between text-left h-auto py-3 hover:bg-green-50 hover:border-green-300'
                      }
                    >
                      <div>
                        <div className={idx === 0 ? 'font-bold text-lg' : 'font-semibold'}>
                          {address}
                        </div>
                        {idx === 0 && (
                          <div className="text-xs text-green-100 mt-1">
                            ✓ Most likely your location
                          </div>
                        )}
                        {idx > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Nearby option
                          </div>
                        )}
                      </div>
                      <Home className={idx === 0 ? 'w-6 h-6' : 'w-5 h-5 text-green-600'} />
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Nearby Houses */}
            {nearbyHouses.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Previously Rated Nearby
                </h3>
                <div className="space-y-2">
                  {nearbyHouses.map((house) => (
                    <Button
                      key={house.id}
                      onClick={() => onSelectHouse(house.address)}
                      variant="outline"
                      className="w-full justify-between text-left h-auto py-3 hover:bg-orange-50 hover:border-orange-300"
                    >
                      <div>
                        <div className="font-semibold">{house.address}</div>
                        <div className="text-xs text-gray-500">
                          {house.distance! < 50 ? 'Very close' : `${Math.round(house.distance!)}m away`}
                        </div>
                      </div>
                      <Home className="w-5 h-5 text-orange-600" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {(nearbyHouses.length > 0 || detectedAddresses.length > 0) && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>
            )}

            {/* Custom Address Input */}
            {!showCustomInput ? (
              <Button
                onClick={() => setShowCustomInput(true)}
                variant="outline"
                className="w-full border-dashed border-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Enter a Different House
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House Address or Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1108 or 1108 Main St"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomSubmit()
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowCustomInput(false)
                      setCustomAddress('')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCustomSubmit}
                    disabled={!customAddress.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {nearbyHouses.length === 0 && detectedAddresses.length === 0 && !showCustomInput && !isDetecting && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Unable to detect nearby houses.</p>
                <p className="text-gray-400 text-xs mt-1">Click above to enter a house address manually.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
