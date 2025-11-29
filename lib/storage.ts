import fs from 'fs'
import path from 'path'

// New format (preferred)
export interface Rating {
  id: string
  latitude: number
  longitude: number
  candy_rating: number // 1-5
  decorations_rating: number // 1-5
  notes?: string
  address?: string
  userFingerprint: string
  created_date: string
  // Legacy fields for backward compatibility
  lat?: number
  lng?: number
  decorations?: number
  candy?: number
  timestamp?: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'ratings.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Normalize old format to new format
function normalizeRating(rating: any): Rating {
  // If already in new format, return as is
  if (rating.latitude !== undefined && rating.longitude !== undefined) {
    return rating as Rating
  }
  
  // Convert old format to new format
  return {
    id: rating.id,
    latitude: rating.lat,
    longitude: rating.lng,
    candy_rating: Math.ceil((rating.candy / 10) * 5), // Convert 1-10 to 1-5
    decorations_rating: Math.ceil((rating.decorations / 10) * 5), // Convert 1-10 to 1-5
    notes: rating.notes || '',
    address: rating.address || `${rating.lat?.toFixed(4)}, ${rating.lng?.toFixed(4)}`,
    userFingerprint: rating.userFingerprint,
    created_date: rating.timestamp || rating.created_date || new Date().toISOString(),
    // Keep legacy fields for compatibility
    lat: rating.lat,
    lng: rating.lng,
    decorations: rating.decorations,
    candy: rating.candy,
    timestamp: rating.timestamp,
  }
}

// Read all ratings
export function getAllRatings(): Rating[] {
  ensureDataDir()
  if (!fs.existsSync(DATA_FILE)) {
    return []
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8')
  const ratings = JSON.parse(data)
  return ratings.map(normalizeRating)
}

// Save a new rating
export function saveRating(rating: Omit<Rating, 'id' | 'created_date'>): Rating {
  const ratings = getAllRatings()

  const newRating: Rating = {
    ...rating,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_date: new Date().toISOString(),
    // Ensure required fields
    latitude: rating.latitude,
    longitude: rating.longitude,
    candy_rating: rating.candy_rating,
    decorations_rating: rating.decorations_rating,
    notes: rating.notes || '',
    address: rating.address || `${rating.latitude.toFixed(4)}, ${rating.longitude.toFixed(4)}`,
    userFingerprint: rating.userFingerprint,
  }

  ratings.push(newRating)

  ensureDataDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(ratings, null, 2))

  return newRating
}

// Check if user has already rated this house
export function hasUserRatedHouse(
  userFingerprint: string,
  lat: number,
  lng: number,
  toleranceMeters: number = 10
): boolean {
  const ratings = getAllRatings()

  // Convert tolerance to approximate degrees (rough approximation)
  const toleranceDegrees = toleranceMeters / 111320

  return ratings.some(
    (rating) =>
      rating.userFingerprint === userFingerprint &&
      Math.abs((rating.latitude || rating.lat || 0) - lat) < toleranceDegrees &&
      Math.abs((rating.longitude || rating.lng || 0) - lng) < toleranceDegrees
  )
}

// Delete a rating by ID
export function deleteRating(ratingId: string): boolean {
  const ratings = getAllRatings()
  const initialLength = ratings.length
  const filtered = ratings.filter(r => r.id !== ratingId)
  
  if (filtered.length < initialLength) {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2))
    return true
  }
  return false
}
