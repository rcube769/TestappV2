import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateHouse } from '@/lib/houses'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude } = body

    if (!latitude || !longitude) {
      return NextResponse.json(
        { ok: false, error: 'Latitude and longitude required' },
        { status: 400 }
      )
    }

    // Find or create the closest house (within 50 meters)
    const house = findOrCreateHouse(latitude, longitude, 50)

    return NextResponse.json({ ok: true, house })
  } catch (error) {
    console.error('Error finding house:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to find house' },
      { status: 500 }
    )
  }
}

