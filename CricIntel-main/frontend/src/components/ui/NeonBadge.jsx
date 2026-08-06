import React from 'react'
import { cn } from '@/utils/cn'

const variants = {
 default: 'bg-white/10 text-gray-300 border-white/20',
 primary: 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
 blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
 purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
 amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
 danger: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
}

const NeonBadge = ({ children, variant = 'default', className = '' }) => {
 return (
 <span className={cn(
 "inline-flex items-center px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-widest",
 variants[variant] || variants.default,
 className
 )}>
 {children}
 </span>
 )
}

export default NeonBadge
