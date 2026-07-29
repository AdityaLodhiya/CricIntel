import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import GlassCard from '@/components/ui/GlassCard'

const PlayerProfile = () => {
  const { playerId } = useParams()
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-space font-bold text-white">Player Analysis</h1>
      <GlassCard>
        <p className="text-gray-400">Deep dive performance metrics and SHAP contributions coming soon for player {playerId}...</p>
      </GlassCard>
    </motion.div>
  )
}
export default PlayerProfile
