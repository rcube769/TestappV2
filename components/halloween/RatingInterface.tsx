'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, X, Ghost, Candy, Sparkles, Home, Lightbulb, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface RatingInterfaceProps {
  onClose: () => void
  onSubmit: (candyRating: number, decorationsRating: number, notes: string) => void
  isSubmitting: boolean
  houseAddress?: string
}

export default function RatingInterface({ onClose, onSubmit, isSubmitting, houseAddress }: RatingInterfaceProps) {
  const { theme, themeConfig } = useTheme()
  const [candyRating, setCandyRating] = useState(0)
  const [decorationsRating, setDecorationsRating] = useState(0)
  const [hoveredCandyRating, setHoveredCandyRating] = useState(0)
  const [hoveredDecorationsRating, setHoveredDecorationsRating] = useState(0)
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (candyRating > 0 && decorationsRating > 0) {
      onSubmit(candyRating, decorationsRating, notes)
    }
  }

  const Rating1Icon = theme === 'halloween' ? Candy : Lightbulb
  const Rating2Icon = theme === 'halloween' ? Sparkles : Gift
  const HeaderIcon = theme === 'halloween' ? Ghost : () => <span className="text-2xl">🎄</span>

  const borderColor = theme === 'halloween' ? 'border-orange-200' : 'border-red-200'
  const rating1Color = theme === 'halloween' ? 'orange' : 'red'
  const rating2Color = theme === 'halloween' ? 'purple' : 'green'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className={`border-2 ${borderColor} shadow-2xl`}>
            <CardHeader className={`bg-gradient-to-r ${themeConfig.colors.gradient} text-white relative`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-2 right-2 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <HeaderIcon />
                <CardTitle className="text-2xl">Rate This House</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Show selected house */}
              {houseAddress && (
                <div className={`bg-${rating2Color}-50 border border-${rating2Color}-200 rounded-lg p-3`}>
                  <div className={`flex items-center gap-2 text-${rating2Color}-700`}>
                    <Home className="w-4 h-4" />
                    <span className="font-semibold text-sm">Rating: {houseAddress}</span>
                  </div>
                </div>
              )}

              {/* Rating 1 (Candy/Lights) */}
              <div className={`text-center p-4 bg-${rating1Color}-50 rounded-lg`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Rating1Icon className={`w-5 h-5 text-${rating1Color}-600`} />
                  <p className="text-sm font-semibold text-gray-700">{themeConfig.labels.rating1}</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => setCandyRating(star)}
                      onMouseEnter={() => setHoveredCandyRating(star)}
                      onMouseLeave={() => setHoveredCandyRating(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-all ${
                          star <= (hoveredCandyRating || candyRating)
                            ? `fill-${rating1Color}-500 text-${rating1Color}-500`
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {candyRating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 text-sm font-medium text-${rating1Color}-600`}
                  >
                    {themeConfig.labels.rating1Descriptions[candyRating]}
                  </motion.p>
                )}
              </div>

              {/* Rating 2 (Decorations) */}
              <div className={`text-center p-4 bg-${rating2Color}-50 rounded-lg`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Rating2Icon className={`w-5 h-5 text-${rating2Color}-600`} />
                  <p className="text-sm font-semibold text-gray-700">{themeConfig.labels.rating2}</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => setDecorationsRating(star)}
                      onMouseEnter={() => setHoveredDecorationsRating(star)}
                      onMouseLeave={() => setHoveredDecorationsRating(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-all ${
                          star <= (hoveredDecorationsRating || decorationsRating)
                            ? `fill-${rating2Color}-500 text-${rating2Color}-500`
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {decorationsRating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 text-sm font-medium text-${rating2Color}-600`}
                  >
                    {themeConfig.labels.rating2Descriptions[decorationsRating]}
                  </motion.p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="What made this house special?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={candyRating === 0 || decorationsRating === 0 || isSubmitting}
                  className={`flex-1 bg-gradient-to-r ${themeConfig.colors.gradient} hover:from-${rating1Color}-600 hover:to-${rating2Color}-700`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

