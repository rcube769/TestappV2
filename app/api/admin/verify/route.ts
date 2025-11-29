import { NextRequest, NextResponse } from 'next/server'

// Admin code - set ADMIN_CODE environment variable to change this
// Default is 'vishwesh'
const ADMIN_CODE = process.env.ADMIN_CODE || 'vishwesh'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { ok: false, error: 'Code required' },
        { status: 400 }
      )
    }

    if (code === ADMIN_CODE) {
      return NextResponse.json({ ok: true, authenticated: true })
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid code' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error verifying admin code:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

