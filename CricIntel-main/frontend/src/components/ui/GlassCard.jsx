import React from 'react'
import { cn } from '@/utils/cn'

const variants = {
 default: 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]',
 primary: 'bg-primary/[0.05] border-primary/[0.15] hover:border-primary/[0.3]',
 blue: 'bg-neon-blue/[0.05] border-neon-blue/[0.15] hover:border-neon-blue/[0.3]',
 purple: 'bg-neon-purple/[0.05] border-neon-purple/[0.15] hover:border-neon-purple/[0.3]',
 static: 'bg-white/[0.03] border-white/[0.06]',
}

const GlassCard = ({ children, variant = 'default', className = '', noPadding = false, onClick, ...props }) => {
 return (
 <div
 onClick={onClick}
 className={cn(
 'relative backdrop-blur-xl border rounded-2xl transition-all duration-300 overflow-hidden',
 variants[variant] || variants.default,
 !noPadding && 'p-6',
 onClick && 'cursor-pointer',
 className
 )}
 style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
 {...props}
 >
 {children}
 </div>
 )
}

export default GlassCard
