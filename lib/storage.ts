import { kv } from '@vercel/kv'

// New format (preferred)
export interface Rating {
  id: string
  house_id: string // ID of the house being rated
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

const RATINGS_KEY = 'halloween:ratings'
const USER_RATINGS_KEY_PREFIX = 'halloween:user_ratings:'

// Normalize old format to new format
function normalizeRating(rating: any): Rating {
  // If already in new format, ensure house_id exists
  if (rating.latitude !== undefined && rating.longitude !== undefined) {
    // If missing house_id, generate one based on location (for backward compatibility)
    if (!rating.house_id) {
      rating.house_id = `house-${rating.latitude.toFixed(5)}-${rating.longitude.toFixed(5)}`
    }
    return rating as Rating
  }

  // Convert old format to new format
  const lat = rating.lat || rating.latitude
  const lng = rating.lng || rating.longitude
  return {
    id: rating.id,
    house_id: rating.house_id || `house-${lat?.toFixed(5)}-${lng?.toFixed(5)}`,
    latitude: lat,
    longitude: lng,
    candy_rating: Math.ceil((rating.candy / 10) * 5), // Convert 1-10 to 1-5
    decorations_rating: Math.ceil((rating.decorations / 10) * 5), // Convert 1-10 to 1-5
    notes: rating.notes || '',
    address: rating.address || `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`,
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
export async function getAllRatings(): Promise<Rating[]> {
  try {
    const ratings = await kv.get<Rating[]>(RATINGS_KEY)
    if (!ratings || !Array.isArray(ratings)) {
      return []
    }
    return ratings.map(normalizeRating)
  } catch (error) {
    console.error('Error getting all ratings:', error)
    return []
  }
}

// Save a new rating
export async function saveRating(rating: Omit<Rating, 'id' | 'created_date'>): Promise<Rating> {
  const ratings = await getAllRatings()

  const newRating: Rating = {
    ...rating,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_date: new Date().toISOString(),
    // Ensure required fields
    house_id: rating.house_id || `house-${rating.latitude.toFixed(5)}-${rating.longitude.toFixed(5)}`,
    latitude: rating.latitude,
    longitude: rating.longitude,
    candy_rating: rating.candy_rating,
    decorations_rating: rating.decorations_rating,
    notes: rating.notes || '',
    address: rating.address || `${rating.latitude.toFixed(4)}, ${rating.longitude.toFixed(4)}`,
    userFingerprint: rating.userFingerprint,
  }

  ratings.push(newRating)

  // Save to KV
  await kv.set(RATINGS_KEY, ratings)

  // Track user's ratings for this house for quick duplicate checking
  const userRatingsKey = `${USER_RATINGS_KEY_PREFIX}${rating.userFingerprint}`
  const userHouseIds = await kv.get<string[]>(userRatingsKey) || []
  if (!userHouseIds.includes(newRating.house_id)) {
    userHouseIds.push(newRating.house_id)
    await kv.set(userRatingsKey, userHouseIds)
  }

  return newRating
}

// Check if user has already rated a specific house
export async function hasUserRatedHouse(
  userFingerprint: string,
  houseId: string
): Promise<boolean> {
  try {
    // Fast path: check user's specific ratings
    const userRatingsKey = `${USER_RATINGS_KEY_PREFIX}${userFingerprint}`
    const userHouseIds = await kv.get<string[]>(userRatingsKey)

    if (userHouseIds && userHouseIds.includes(houseId)) {
      return true
    }

    // Fallback: check all ratings (for backward compatibility)
    const ratings = await getAllRatings()
    return ratings.some(
      (rating) =>
        rating.userFingerprint === userFingerprint &&
        rating.house_id === houseId
    )
  } catch (error) {
    console.error('Error checking if user rated house:', error)
    // Fallback to checking all ratings
    const ratings = await getAllRatings()
    return ratings.some(
      (rating) =>
        rating.userFingerprint === userFingerprint &&
        rating.house_id === houseId
    )
  }
}

// Delete a rating by ID
export async function deleteRating(ratingId: string): Promise<boolean> {
  try {
    const ratings = await getAllRatings()
    const initialLength = ratings.length
    const filtered = ratings.filter(r => r.id !== ratingId)

    if (filtered.length < initialLength) {
      await kv.set(RATINGS_KEY, filtered)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting rating:', error)
    return false
  }
}
