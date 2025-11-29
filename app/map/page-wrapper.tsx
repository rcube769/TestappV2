'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const HalloweenMap = dynamic(() => import('./page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
        <p className="text-gray-700">Loading map...</p>
      </div>
    </div>
  ),
})

export default HalloweenMap

