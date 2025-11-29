'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, TrendingUp, Candy, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface House {
  latitude: number
  longitude: number
  averageCandyRating: number
  averageDecorationsRating: number
  averageRating: number
  totalRatings: number
  distance?: number
}

interface NearbyHousesListProps {
  houses: House[]
  userLocation: { lat: number; lng: number } | null
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000 // Return distance in meters
}

export default function NearbyHousesList({ houses, userLocation }: NearbyHousesListProps) {
  const housesWithDistance = userLocation
    ? houses
        .map((house) => ({
          ...house,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            house.latitude,
            house.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10)
    : houses.slice(0, 10)

  const topRatedHouses = [...houses].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Top Rated */}
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-purple-100 border-b border-orange-200">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Top Rated Houses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {topRatedHouses.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No ratings yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {topRatedHouses.map((house, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0
                          ? 'bg-orange-500'
                          : idx === 1
                          ? 'bg-orange-400'
                          : 'bg-orange-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-xs text-gray-500">{house.totalRatings} ratings</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Candy className="w-3 h-3 text-orange-500" />
                        <span className="text-gray-600">Candy</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(house.averageCandyRating)
                                ? 'fill-orange-500 text-orange-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-semibold ml-1">{house.averageCandyRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-600">Decor</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(house.averageDecorationsRating)
                                ? 'fill-purple-500 text-purple-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-semibold ml-1">{house.averageDecorationsRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Houses */}
      {userLocation && (
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-orange-100 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
              Nearby Houses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {housesWithDistance.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No nearby houses rated yet</p>
            ) : (
              <div className="space-y-2">
                {housesWithDistance.map((house, idx) => {
                  const distance = house.distance ?? 0
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {distance < 1000
                            ? `${Math.round(distance)}m`
                            : `${(distance / 1000).toFixed(1)}km`}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                          <span className="text-sm font-semibold">{house.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{house.totalRatings} ratings</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-purple-50 border-orange-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-orange-600">{houses.length}</p>
              <p className="text-sm text-gray-600">Houses Rated</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {houses.reduce((sum, h) => sum + h.totalRatings, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Ratings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

