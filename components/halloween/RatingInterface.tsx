'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, X, Ghost, Candy, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RatingInterfaceProps {
  onClose: () => void
  onSubmit: (candyRating: number, decorationsRating: number, notes: string) => void
  isSubmitting: boolean
}

export default function RatingInterface({ onClose, onSubmit, isSubmitting }: RatingInterfaceProps) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-orange-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-purple-600 text-white relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-2 right-2 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Ghost className="w-8 h-8" />
                <CardTitle className="text-2xl">Rate This House</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Candy Rating */}
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Candy className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-semibold text-gray-700">Candy Quality</p>
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
                            ? 'fill-orange-500 text-orange-500'
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
                    className="mt-2 text-sm font-medium text-orange-600"
                  >
                    {candyRating === 1 && '😕 Not great'}
                    {candyRating === 2 && '🍬 Okay'}
                    {candyRating === 3 && '🍭 Good candy'}
                    {candyRating === 4 && '🍫 Great stuff!'}
                    {candyRating === 5 && '🎃 Full size bars!'}
                  </motion.p>
                )}
              </div>

              {/* Decorations Rating */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-semibold text-gray-700">Decorations</p>
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
                            ? 'fill-purple-500 text-purple-500'
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
                    className="mt-2 text-sm font-medium text-purple-600"
                  >
                    {decorationsRating === 1 && '👻 Minimal effort'}
                    {decorationsRating === 2 && '🎃 Some decorations'}
                    {decorationsRating === 3 && '🦇 Pretty festive'}
                    {decorationsRating === 4 && '🕷️ Very spooky!'}
                    {decorationsRating === 5 && '💀 Amazing setup!'}
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
                  className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
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

