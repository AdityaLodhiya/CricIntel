import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const GlowButton = ({ 
  children, 
  onClick, 
  className, 
  variant = 'primary', 
  isLoading = false,
  ...props 
}) => {
  const baseClasses = 'relative px-6 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden'
  
  const variants = {
    primary: 'bg-primary/90 text-black hover:bg-primary shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:shadow-[0_0_25px_rgba(0,230,118,0.6)]',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20',
    danger: 'bg-danger/90 text-white hover:bg-danger shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseClasses, variants[variant], className)}
      onClick={onClick}
      disabled={isLoading}
      {...props}
    >
      {/* Glow Effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -z-10 bg-primary opacity-20 blur-xl rounded-full scale-150 animate-pulse"></div>
      )}
      
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}

export default GlowButton
