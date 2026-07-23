import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlowButton from '@/components/ui/GlowButton'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-9xl font-space font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">404</h1>
        <div className="-mt-12 mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Delivery Not Found</h2>
          <p className="text-gray-400 max-w-md mx-auto">It looks like this page has been hit out of the park. We can't seem to find the content you're looking for.</p>
        </div>
        <Link to="/">
          <GlowButton>Back to Pavilion</GlowButton>
        </Link>
      </motion.div>
    </div>
  )
}
export default NotFound
