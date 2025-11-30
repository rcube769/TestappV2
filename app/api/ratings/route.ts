import { NextRequest, NextResponse } from 'next/server'
import { getAllRatings } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const theme = searchParams.get('theme') || 'halloween'

    const ratings = await getAllRatings(theme as 'halloween' | 'christmas')
    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
