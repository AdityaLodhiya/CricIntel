import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import GlassCard from '@/components/ui/GlassCard'

const VenueAnalysis = () => {
 const { venueId } = useParams()
 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
 <h1 className="text-3xl font-space font-bold text-white">Venue Analysis: {venueId}</h1>
 <GlassCard>
 <p className="text-gray-400">Detailed pitch mapping and venue intelligence coming soon...</p>
 </GlassCard>
 </motion.div>
 )
}
export default VenueAnalysis
