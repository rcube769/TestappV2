'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Ghost, MapPin, Star, Loader2, Navigation, AlertCircle, Candy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RatingInterface from '@/components/halloween/RatingInterface'
import NearbyHousesList from '@/components/halloween/NearbyHousesList'
import Leaderboard from '@/components/halloween/Leaderboard'
import MyRatings from '@/components/halloween/MyRatings'
import AdminPanel from '@/components/halloween/AdminPanel'
import { getFingerprint } from '@/lib/fingerprint'
import { Shield, X } from 'lucide-react'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (avgRating: number) => {
  const color = avgRating >= 4 ? '#f97316' : avgRating >= 3 ? '#eab308' : '#6b7280'
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-weight: bold; color: white; font-size: 14px;">★</div>`,
    iconSize: [32, 32],
  })
}

const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background: #8b5cf6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3); animation: pulse 2s infinite;"></div>`,
  iconSize: [20, 20],
})

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 16)
    }
  }, [center, map])
  return null
}

interface Rating {
  id: string
  latitude: number
  longitude: number
  candy_rating: number
  decorations_rating: number
  notes?: string
  address?: string
  userFingerprint: string
  created_date: string
  [key: string]: any
}

export default function HalloweenMap() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showRatingInterface, setShowRatingInterface] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060])
  const [alreadyRatedError, setAlreadyRatedError] = useState<string | null>(null)
  const [currentUserFingerprint, setCurrentUserFingerprint] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [showAdminInput, setShowAdminInput] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Check if admin is authenticated from localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem('adminAuthenticated')
    if (adminStatus === 'true') {
      setIsAdmin(true)
    }
  }, [])

  // Fetch ratings
  const { data: ratings = [], isLoading } = useQuery<Rating[]>({
    queryKey: ['houseRatings'],
    queryFn: async () => {
      const response = await fetch('/api/ratings')
      const data = await response.json()
      return data.ratings || []
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })

  // Get user fingerprint
  useEffect(() => {
    getFingerprint().then(setCurrentUserFingerprint).catch(() => {})
  }, [])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          setMapCenter([location.lat, location.lng])
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Group ratings by location to calculate averages
  const houseData = ratings.reduce((acc, rating) => {
    const key = `${rating.latitude.toFixed(5)},${rating.longitude.toFixed(5)}`
    if (!acc[key]) {
      acc[key] = {
        latitude: rating.latitude,
        longitude: rating.longitude,
        address: rating.address,
        ratings: [],
      }
    }
    acc[key].ratings.push(rating)
    return acc
  }, {} as Record<string, { latitude: number; longitude: number; address?: string; ratings: Rating[] }>)

  const houses = Object.values(houseData).map((house) => ({
    ...house,
    averageCandyRating:
      house.ratings.reduce((sum, r) => sum + r.candy_rating, 0) / house.ratings.length,
    averageDecorationsRating:
      house.ratings.reduce((sum, r) => sum + r.decorations_rating, 0) / house.ratings.length,
    averageRating:
      house.ratings.reduce((sum, r) => sum + (r.candy_rating + r.decorations_rating) / 2, 0) /
      house.ratings.length,
    totalRatings: house.ratings.length,
  }))

  const createRatingMutation = useMutation({
    mutationFn: async (ratingData: {
      latitude: number
      longitude: number
      candy_rating: number
      decorations_rating: number
      notes: string
      address: string
      userFingerprint: string
    }) => {
      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create rating')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseRatings'] })
      setShowRatingInterface(false)
      setAlreadyRatedError(null)
    },
    onError: (error: Error) => {
      if (error.message.includes('already rated')) {
        setAlreadyRatedError(error.message)
        setTimeout(() => setAlreadyRatedError(null), 3000)
      }
    },
  })

  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: string) => {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete rating')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseRatings'] })
    },
  })

  const hasUserRatedLocation = (lat: number, lng: number) => {
    if (!currentUserFingerprint) return false
    return ratings.some(
      (rating) =>
        rating.userFingerprint === currentUserFingerprint &&
        Math.abs(rating.latitude - lat) < 0.0001 &&
        Math.abs(rating.longitude - lng) < 0.0001
    )
  }

  const handleRateCurrentLocation = () => {
    if (userLocation) {
      if (hasUserRatedLocation(userLocation.lat, userLocation.lng)) {
        setAlreadyRatedError("You've already rated this house!")
        setTimeout(() => setAlreadyRatedError(null), 3000)
      } else {
        setShowRatingInterface(true)
      }
    }
  }

  const handleSubmitRating = async (candyRating: number, decorationsRating: number, notes: string) => {
    if (!userLocation || !currentUserFingerprint) return

    const ratingData = {
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      candy_rating: candyRating,
      decorations_rating: decorationsRating,
      notes: notes || '',
      address: `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`,
      userFingerprint: currentUserFingerprint,
    }

    createRatingMutation.mutate(ratingData)
  }

  const handleDeleteRating = (ratingId: string) => {
    if (confirm('Are you sure you want to delete this rating?')) {
      deleteRatingMutation.mutate(ratingId)
    }
  }

  const handleAdminLogin = async () => {
    setAdminError(null)
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: adminCode }),
      })
      const data = await response.json()
      if (data.ok && data.authenticated) {
        setIsAdmin(true)
        setShowAdminInput(false)
        setAdminCode('')
        localStorage.setItem('adminAuthenticated', 'true')
      } else {
        setAdminError(data.error || 'Invalid code')
      }
    } catch (error) {
      setAdminError('Failed to verify code')
    }
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('adminAuthenticated')
    setShowAdminInput(false)
    setAdminCode('')
  }

  const recenterMap = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-orange-50">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .leaflet-container {
          border-radius: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-purple-600 to-orange-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ghost className="w-8 h-8 animate-bounce" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">🎃 Trick-or-Treat Rater</h1>
              <p className="text-orange-100 text-sm">Rate candy & decorations at each house!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userLocation && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <MapPin className="w-3 h-3 mr-1" />
                Location Active
              </Badge>
            )}
            {/* Admin Code Input */}
            {!isAdmin ? (
              <div className="relative">
                {!showAdminInput ? (
                  <Button
                    onClick={() => setShowAdminInput(true)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 border border-white/30"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                    <input
                      type="password"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdminLogin()
                        } else if (e.key === 'Escape') {
                          setShowAdminInput(false)
                          setAdminCode('')
                          setAdminError(null)
                        }
                      }}
                      placeholder="Enter admin code"
                      className="bg-white/20 text-white placeholder:text-white/70 border border-white/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-32"
                      autoFocus
                    />
                    <Button
                      onClick={handleAdminLogin}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAdminInput(false)
                        setAdminCode('')
                        setAdminError(null)
                      }}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {adminError && (
                  <div className="absolute top-full mt-1 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                    {adminError}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-white border-green-300/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Mode
                </Badge>
                <Button
                  onClick={handleAdminLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            {alreadyRatedError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{alreadyRatedError}</AlertDescription>
              </Alert>
            )}
            {!userLocation ? (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
                  <p className="text-gray-700">Getting your location...</p>
                  <p className="text-sm text-gray-500 mt-2">Make sure location services are enabled</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="relative">
                  <MapContainer
                    center={mapCenter}
                    zoom={16}
                    style={{ height: '500px', width: '100%' }}
                    className="z-0"
                  >
                    <MapController center={mapCenter} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {/* User location */}
                    {userLocation && (
                      <>
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold">You are here!</p>
          </div>
                          </Popup>
                        </Marker>
                        <Circle
                          center={[userLocation.lat, userLocation.lng]}
                          radius={50}
                          pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.1 }}
                        />
                      </>
                    )}
                    {/* Rated houses */}
                    {houses.map((house, idx) => (
                      <Marker
                        key={idx}
                        position={[house.latitude, house.longitude]}
                        icon={createCustomIcon(house.averageRating)}
                      >
                        <Popup>
                          <div className="py-2 min-w-[200px]">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Candy className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm font-medium">Candy:</span>
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
                                  <span className="text-sm font-bold ml-1">
                                    {house.averageCandyRating.toFixed(1)}
                                  </span>
                                </div>
          </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-medium">Decor:</span>
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
                                  <span className="text-sm font-bold ml-1">
                                    {house.averageDecorationsRating.toFixed(1)}
                                  </span>
              </div>
              </div>
            </div>
                            <p className="text-sm text-gray-600 mt-2 text-center">
                              {house.totalRatings} ratings
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  {/* Floating controls */}
                  <Button
                    onClick={recenterMap}
                    className="absolute bottom-4 right-4 z-[1000] bg-purple-600 hover:bg-purple-700 shadow-lg"
                    size="icon"
                  >
                    <Navigation className="w-5 h-5" />
                  </Button>
                </div>
                {/* Rate Current Location Button */}
                <Button
                  onClick={handleRateCurrentLocation}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 shadow-lg"
                  size="lg"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Rate This House
                </Button>
              </>
            )}
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {isAdmin ? (
              <AdminPanel
                ratings={ratings}
                onDelete={handleDeleteRating}
                isDeleting={deleteRatingMutation.isPending}
              />
            ) : (
              <>
                <Leaderboard ratings={ratings} currentUserFingerprint={currentUserFingerprint} />
                <MyRatings
                  ratings={ratings}
                  currentUserFingerprint={currentUserFingerprint}
                  onDelete={handleDeleteRating}
                  isDeleting={deleteRatingMutation.isPending}
                />
              </>
            )}
            <NearbyHousesList houses={houses} userLocation={userLocation} />
          </div>
        </div>
      </div>
      {/* Rating Interface Modal */}
      {showRatingInterface && (
        <RatingInterface
          onClose={() => setShowRatingInterface(false)}
          onSubmit={handleSubmitRating}
          isSubmitting={createRatingMutation.isPending}
        />
      )}
    </div>
  )
}
