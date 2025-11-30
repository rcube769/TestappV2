import { kv } from '@vercel/kv'

export type ThemeType = 'halloween' | 'christmas'

// New format (preferred)
export interface Rating {
  id: string
  house_id: string // ID of the house being rated
  latitude: number
  longitude: number
  candy_rating: number // 1-5 (or lights_rating for christmas)
  decorations_rating: number // 1-5
  notes?: string
  address?: string
  userFingerprint: string
  created_date: string
  theme: ThemeType // Track which theme this rating belongs to
  // Legacy fields for backward compatibility
  lat?: number
  lng?: number
  decorations?: number
  candy?: number
  timestamp?: string
}

const getRatingsKey = (theme: ThemeType) => `${theme}:ratings`
const getUserRatingsKeyPrefix = (theme: ThemeType) => `${theme}:user_ratings:`

// Normalize old format to new format
function normalizeRating(rating: any): Rating {
  // If already in new format, ensure house_id and theme exist
  if (rating.latitude !== undefined && rating.longitude !== undefined) {
    // If missing house_id, generate one based on location (for backward compatibility)
    if (!rating.house_id) {
      rating.house_id = `house-${rating.latitude.toFixed(5)}-${rating.longitude.toFixed(5)}`
    }
    // If missing theme, default to halloween (for backward compatibility)
    if (!rating.theme) {
      rating.theme = 'halloween'
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
    theme: rating.theme || 'halloween', // Default to halloween for backward compatibility
    // Keep legacy fields for compatibility
    lat: rating.lat,
    lng: rating.lng,
    decorations: rating.decorations,
    candy: rating.candy,
    timestamp: rating.timestamp,
  }
}

// Read all ratings for a specific theme
export async function getAllRatings(theme: ThemeType = 'halloween'): Promise<Rating[]> {
  try {
    const ratingsKey = getRatingsKey(theme)
    const ratings = await kv.get<Rating[]>(ratingsKey)
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
  const theme = rating.theme || 'halloween'
  const ratings = await getAllRatings(theme)

  const newRating: Rating = {
    ...rating,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_date: new Date().toISOString(),
    theme: theme,
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

  // Save to theme-specific KV key
  const ratingsKey = getRatingsKey(theme)
  await kv.set(ratingsKey, ratings)

  // Track user's ratings for this house for quick duplicate checking
  const userRatingsKey = `${getUserRatingsKeyPrefix(theme)}${rating.userFingerprint}`
  const userHouseIds = await kv.get<string[]>(userRatingsKey) || []
  if (!userHouseIds.includes(newRating.house_id)) {
    userHouseIds.push(newRating.house_id)
    await kv.set(userRatingsKey, userHouseIds)
  }

  return newRating
}

// Check if user has already rated a specific house in a specific theme
export async function hasUserRatedHouse(
  userFingerprint: string,
  houseId: string,
  theme: ThemeType = 'halloween'
): Promise<boolean> {
  try {
    // Always check all ratings (most reliable source of truth)
    // Skip the fast-path cache to avoid stale data issues
    const ratings = await getAllRatings(theme)
    const hasRated = ratings.some(
      (rating) =>
        rating.userFingerprint === userFingerprint &&
        rating.house_id === houseId
    )

    console.log(`Checking if user ${userFingerprint} rated house ${houseId} in ${theme}: ${hasRated}`)
    return hasRated
  } catch (error) {
    console.error('Error checking if user rated house:', error)
    // On error, return false to allow rating (fail open)
    return false
  }
}

// Delete a rating by ID (searches across both themes)
export async function deleteRating(ratingId: string): Promise<boolean> {
  try {
    // Try deleting from Halloween ratings
    const halloweenRatings = await getAllRatings('halloween')
    const halloweenFiltered = halloweenRatings.filter(r => r.id !== ratingId)

    if (halloweenFiltered.length < halloweenRatings.length) {
      await kv.set(getRatingsKey('halloween'), halloweenFiltered)
      return true
    }

    // Try deleting from Christmas ratings
    const christmasRatings = await getAllRatings('christmas')
    const christmasFiltered = christmasRatings.filter(r => r.id !== ratingId)

    if (christmasFiltered.length < christmasRatings.length) {
      await kv.set(getRatingsKey('christmas'), christmasFiltered)
      return true
    }

    return false
  } catch (error) {
    console.error('Error deleting rating:', error)
    return false
  }
}
