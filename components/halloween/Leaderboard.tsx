'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Star, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface Rating {
  id: string
  userFingerprint: string
  [key: string]: any
}

interface LeaderboardProps {
  ratings: Rating[]
  currentUserFingerprint: string | null
}

export default function Leaderboard({ ratings, currentUserFingerprint }: LeaderboardProps) {
  // Count ratings per user
  const userCounts = ratings.reduce((acc, rating) => {
    const fingerprint = rating.userFingerprint
    if (!acc[fingerprint]) {
      acc[fingerprint] = { fingerprint, count: 0 }
    }
    acc[fingerprint].count++
    return acc
  }, {} as Record<string, { fingerprint: string; count: number }>)

  const leaderboard = Object.values(userCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const getIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />
    return <Star className="w-5 h-5 text-purple-500" />
  }

  const getUsername = (fingerprint: string) => {
    if (!fingerprint) return 'Anonymous'
    return `User ${fingerprint.slice(0, 6)}`
  }

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-100 via-orange-100 to-purple-100 border-b border-purple-200">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-purple-600" />
          Top Trick-or-Treaters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No ratings yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((user, idx) => {
              const isCurrentUser = currentUserFingerprint && user.fingerprint === currentUserFingerprint
              return (
                <motion.div
                  key={user.fingerprint}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-purple-100 to-orange-100 border-purple-300 shadow-md'
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        idx === 0
                          ? 'bg-yellow-100'
                          : idx === 1
                          ? 'bg-gray-100'
                          : idx === 2
                          ? 'bg-orange-100'
                          : 'bg-purple-100'
                      }`}
                    >
                      {getIcon(idx)}
                    </div>
                    <div>
                      <p className={`font-semibold ${isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
                        {getUsername(user.fingerprint)}
                        {isCurrentUser && <span className="text-purple-600 ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.count} {user.count === 1 ? 'house' : 'houses'} rated
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        idx === 0
                          ? 'text-yellow-600'
                          : idx === 1
                          ? 'text-gray-500'
                          : idx === 2
                          ? 'text-orange-600'
                          : 'text-purple-600'
                      }`}
                    >
                      {user.count}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

