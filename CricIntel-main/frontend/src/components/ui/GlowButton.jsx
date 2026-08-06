import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] text-white hover:opacity-90',
  secondary: 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] hover:border-white/[0.15]',
  danger: 'bg-danger/90 hover:bg-danger text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  ghost: 'bg-transparent hover:bg-white/[0.05] text-gray-400 hover:text-white',
  outline: 'bg-transparent border-2 border-blue-500/50 hover:border-blue-500 text-blue-400 hover:bg-blue-500/10',
}

const sizes = {
 sm: 'px-4 py-2 text-xs',
 md: 'px-6 py-3 text-sm',
 lg: 'px-8 py-3.5 text-base',
 xl: 'px-10 py-4 text-base',
}

const GlowButton = ({ 
 children, 
 variant = 'primary', 
 size = 'md',
 isLoading = false, 
 disabled = false,
 className = '', 
 type = 'button',
 onClick,
 ...props 
}) => {
 return (
 <motion.button
 type={type}
 onClick={onClick}
 disabled={disabled || isLoading}
 whileHover={{ scale: disabled ? 1 : 1.02 }}
 whileTap={{ scale: disabled ? 1 : 0.97 }}
 className={cn(
 'relative font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2',
 variants[variant] || variants.primary,
 sizes[size] || sizes.md,
 (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
 className
 )}
 {...props}
 >
 {isLoading && <Loader2 size={16} className="animate-spin" />}
 {children}
 </motion.button>
 )
}

export default GlowButton
