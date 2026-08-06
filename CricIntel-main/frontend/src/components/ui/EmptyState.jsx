import React from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import GlowButton from './GlowButton'
import { cn } from '@/utils/cn'

const EmptyState = ({ 
 icon: Icon = Search, 
 title = "No data found", 
 description = "Try adjusting your filters or search terms.",
 actionLabel = "",
 onAction = null,
 className = ""
}) => {
 return (
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className={cn("flex flex-col items-center justify-center p-12 text-center border border-white/[0.04] rounded-2xl bg-white/[0.01]", className)}
 >
 <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mb-6">
 <Icon size={32} className="text-gray-500" />
 </div>
 <h3 className="text-xl font-space font-bold text-white mb-2">{title}</h3>
 <p className="text-sm text-gray-400 max-w-[300px] mx-auto mb-6">{description}</p>
 
 {actionLabel && onAction && (
 <GlowButton variant="secondary" size="sm" onClick={onAction}>
 {actionLabel}
 </GlowButton>
 )}
 </motion.div>
 )
}

export default EmptyState
