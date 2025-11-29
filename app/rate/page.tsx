'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getFingerprint } from '@/lib/fingerprint'

const MapSelector = dynamic(() => import('@/components/MapSelector'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-400">Loading map...</p>
    </div>
  ),
})

export default function RatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [decorations, setDecorations] = useState(5)
  const [candy, setCandy] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fingerprint, setFingerprint] = useState<string | null>(null)

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  useEffect(() => {
    if (!lat || !lng) {
      router.push('/')
    } else {
      // Get fingerprint on mount
      getFingerprint().then(setFingerprint)
    }
  }, [lat, lng, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!fingerprint) {
      setError('Unable to verify user identity')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: parseFloat(lat || '0'),
          lng: parseFloat(lng || '0'),
          decorations,
          candy,
          userFingerprint: fingerprint,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      setError('Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (!lat || !lng) {
    return null
  }

  const location: [number, number] = [parseFloat(lat), parseFloat(lng)]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-800">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Rate This House
        </h2>

        <div className="mb-6">
          <div className="h-[300px] w-full">
            <MapSelector
              center={location}
              onLocationSelect={() => {}}
              selectedLocation={location}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded p-4 mb-6 text-sm">
          <p className="text-gray-400">House Location</p>
          <p className="font-mono text-xs text-green-400">
            {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded text-center">
            Rating submitted! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Decorations Rating: {decorations}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={decorations}
                onChange={(e) => setDecorations(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Candy Rating: {candy}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={candy}
                onChange={(e) => setCandy(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !fingerprint}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : !fingerprint ? 'Loading...' : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
