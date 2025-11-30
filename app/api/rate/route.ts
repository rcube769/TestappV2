import { NextRequest, NextResponse } from 'next/server'
import { saveRating, hasUserRatedHouse } from '@/lib/storage'
import { findOrCreateHouseByAddress } from '@/lib/houses'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Support both old and new format
    const lat = body.latitude || body.lat
    const lng = body.longitude || body.lng
    const candy_rating = body.candy_rating || (body.candy ? Math.ceil((body.candy / 10) * 5) : undefined)
    const decorations_rating = body.decorations_rating || (body.decorations ? Math.ceil((body.decorations / 10) * 5) : undefined)
    const notes = body.notes || ''
    const address = body.address
    const userFingerprint = body.userFingerprint
    const theme = body.theme || 'halloween'

    // Validate input
    if (!lat || !lng || candy_rating === undefined || decorations_rating === undefined || !userFingerprint || !address) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields (including house address)' },
        { status: 400 }
      )
    }

    // Validate rating range (1-5)
    if (candy_rating < 1 || candy_rating > 5 || decorations_rating < 1 || decorations_rating > 5) {
      return NextResponse.json(
        { ok: false, error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Find or create house by address
    const house = await findOrCreateHouseByAddress(lat, lng, address)

    // Check if user has already rated this house in this theme
    if (await hasUserRatedHouse(userFingerprint, house.id, theme)) {
      return NextResponse.json(
        { ok: false, error: "You've already rated this house!" },
        { status: 409 }
      )
    }

    // Save the rating with house_id and theme
    const rating = await saveRating({
      house_id: house.id,
      latitude: lat,
      longitude: lng,
      candy_rating,
      decorations_rating,
      notes,
      address: house.address || address,
      userFingerprint,
      theme,
    })

    console.log('New rating saved:', rating)

    return NextResponse.json({ ok: true, rating })
  } catch (error) {
    console.error('Error processing rating:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to process rating' },
      { status: 500 }
    )
  }
}
