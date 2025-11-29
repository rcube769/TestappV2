'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/map')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to map...</p>
      </div>
    </div>
  )
}
