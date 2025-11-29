import fs from 'fs'
import path from 'path'

export interface House {
  id: string
  latitude: number
  longitude: number
  address?: string
  created_date: string
}

const HOUSES_FILE = path.join(process.cwd(), 'data', 'houses.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Read all houses
export function getAllHouses(): House[] {
  ensureDataDir()
  if (!fs.existsSync(HOUSES_FILE)) {
    return []
  }
  const data = fs.readFileSync(HOUSES_FILE, 'utf-8')
  return JSON.parse(data)
}

// Find house by address or create a new one
export function findOrCreateHouseByAddress(
  lat: number,
  lng: number,
  address: string
): House {
  const houses = getAllHouses()

  // First, try to find house by exact address match (case-insensitive)
  const existingHouse = houses.find(
    (h) => h.address && h.address.toLowerCase() === address.toLowerCase()
  )

  if (existingHouse) {
    return existingHouse
  }

  // If not found by address, create a new house with the provided address
  const newHouse: House = {
    id: `house-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    latitude: lat,
    longitude: lng,
    address: address,
    created_date: new Date().toISOString(),
  }

  houses.push(newHouse)
  ensureDataDir()
  fs.writeFileSync(HOUSES_FILE, JSON.stringify(houses, null, 2))

  return newHouse
}

// Find the closest house to a location, or create a new one if none within threshold
export function findOrCreateHouse(
  lat: number,
  lng: number,
  thresholdMeters: number = 50
): House {
  const houses = getAllHouses()

  // Find closest house
  let closestHouse: House | null = null
  let closestDistance = Infinity

  for (const house of houses) {
    const distance = calculateDistance(lat, lng, house.latitude, house.longitude)
    if (distance < closestDistance) {
      closestDistance = distance
      closestHouse = house
    }
  }

  // If closest house is within threshold, return it
  if (closestHouse && closestDistance <= thresholdMeters) {
    return closestHouse
  }

  // Otherwise, create a new house
  const newHouse: House = {
    id: `house-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    latitude: lat,
    longitude: lng,
    address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    created_date: new Date().toISOString(),
  }

  houses.push(newHouse)
  ensureDataDir()
  fs.writeFileSync(HOUSES_FILE, JSON.stringify(houses, null, 2))

  return newHouse
}

// Get house by ID
export function getHouseById(houseId: string): House | null {
  const houses = getAllHouses()
  return houses.find((h) => h.id === houseId) || null
}

