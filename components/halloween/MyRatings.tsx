'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Star, Candy, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Rating {
  id: string
  candy_rating: number
  decorations_rating: number
  notes?: string
  created_date: string
  userFingerprint: string
  [key: string]: any
}

interface MyRatingsProps {
  ratings: Rating[]
  currentUserFingerprint: string | null
  onDelete: (ratingId: string) => void
  isDeleting: boolean
}

export default function MyRatings({ ratings, currentUserFingerprint, onDelete, isDeleting }: MyRatingsProps) {
  const myRatings = ratings.filter(
    (rating) => currentUserFingerprint && rating.userFingerprint === currentUserFingerprint
  )

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-green-600" />
          My Ratings ({myRatings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {myRatings.length === 0 ? (
          <p className="text-center text-gray-500 py-4">You haven't rated any houses yet</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {myRatings.map((rating, idx) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Candy className="w-3 h-3 text-orange-500" />
                          <span className="text-gray-600">Candy:</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating.candy_rating
                                  ? 'fill-orange-500 text-orange-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span className="text-gray-600">Decor:</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating.decorations_rating
                                  ? 'fill-purple-500 text-purple-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.notes && (
                        <p className="text-xs text-gray-500 italic mt-2">"{rating.notes}"</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(rating.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(rating.id)}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

