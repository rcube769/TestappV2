// Configuration for the house rating system
// This system automatically detects and groups houses

export const SINGLE_HOUSE_CONFIG = {
  // Set to false to enable multi-house mode (each house gets rated independently)
  enabled: false,

  // Default map center (when user location is not available)
  location: {
    lat: 37.7749,  // Default center latitude
    lng: -122.4194, // Default center longitude
  },

  // The address/name (only used in single house mode)
  address: "My Halloween House",

  // Matching radius in meters (houses within this distance are considered the same house)
  // Keep this at 50 meters so different houses get separate ratings
  matchingRadius: 50, // meters
}
