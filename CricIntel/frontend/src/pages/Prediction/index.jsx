import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Shield, Target } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import AnimatedInput from '@/components/ui/AnimatedInput'

const Prediction = () => {
  const navigate = useNavigate()
  const [isPredicting, setIsPredicting] = useState(false)

  const [formData, setFormData] = useState({
    format: 'T20',
    gender: 'Men',
    homeTeam: 'India',
    awayTeam: 'Australia',
    venue: 'Wankhede Stadium, Mumbai'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePredict = (e) => {
    e.preventDefault()
    setIsPredicting(true)
    // Simulate API call then go to reveal
    setTimeout(() => {
      navigate('/app/prediction/reveal', { state: formData })
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-space font-bold text-white mb-4">Match Prediction Engine</h1>
        <p className="text-lg text-gray-400">Configure match parameters to generate the optimal Playing XI and win probability.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <form onSubmit={handlePredict} className="space-y-8">
            {/* Format & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Match Format</label>
                <select name="format" value={formData.format} onChange={handleChange} className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Home Team</label>
                <select name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="England">England</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Away Team</label>
                <select name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                  <option value="England">England</option>
                </select>
              </div>
            </div>

            {/* Venue & Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Venue</label>
              <select name="venue" value={formData.venue} onChange={handleChange} className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="Wankhede Stadium, Mumbai">Wankhede Stadium, Mumbai</option>
                <option value="MCG, Melbourne">MCG, Melbourne</option>
                <option value="Lord's, London">Lord's, London</option>
              </select>
            </div>

            <div className="pt-4 flex justify-center">
              <GlowButton 
                type="submit" 
                className="px-12 py-4 text-lg w-full md:w-auto"
                isLoading={isPredicting}
              >
                <Zap className="mr-2" />
                Generate AI Prediction
              </GlowButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Prediction
