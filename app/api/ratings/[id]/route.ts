import { NextRequest, NextResponse } from 'next/server'
import { getAllRatings, deleteRating } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Rating ID required' },
        { status: 400 }
      )
    }

    const deleted = await deleteRating(id)

    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: 'Rating not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting rating:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to delete rating' },
      { status: 500 }
    )
  }
}

