import { NextResponse } from 'next/server'
import { getAllRatings } from '@/lib/storage'

export async function GET() {
  try {
    const ratings = await getAllRatings()
    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
