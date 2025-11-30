'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed top-4 left-4 z-[1000]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden"
      >
        <div className="flex">
          <Button
            onClick={() => setTheme('halloween')}
            variant={theme === 'halloween' ? 'default' : 'ghost'}
            className={`rounded-none px-4 py-2 ${
              theme === 'halloween'
                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                : 'hover:bg-orange-50'
            }`}
          >
            <span className="text-lg mr-2">🎃</span>
            <span className="font-semibold">Halloween</span>
          </Button>
          <Button
            onClick={() => setTheme('christmas')}
            variant={theme === 'christmas' ? 'default' : 'ghost'}
            className={`rounded-none px-4 py-2 ${
              theme === 'christmas'
                ? 'bg-gradient-to-r from-red-500 to-green-600 text-white'
                : 'hover:bg-red-50'
            }`}
          >
            <span className="text-lg mr-2">🎄</span>
            <span className="font-semibold">Christmas</span>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
