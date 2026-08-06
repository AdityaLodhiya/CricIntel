import React from 'react'
import { cn } from '@/utils/cn'

const shapes = {
 line: (w = '100%', h = '12px') => (
 <div className={cn('skeleton rounded-md')} style={{ width: w, height: h }} />
 ),
 circle: (size = '48px') => (
 <div className="skeleton rounded-full" style={{ width: size, height: size }} />
 ),
 rect: (w = '100%', h = '120px') => (
 <div className="skeleton rounded-xl" style={{ width: w, height: h }} />
 ),
}

// Card skeleton with avatar + lines
export const SkeletonCard = ({ className }) => (
 <div className={cn('glass-card-static p-6 space-y-4', className)}>
 <div className="flex items-center gap-3">
 {shapes.circle('40px')}
 <div className="flex-1 space-y-2">
 {shapes.line('60%', '14px')}
 {shapes.line('40%', '10px')}
 </div>
 </div>
 <div className="space-y-2">
 {shapes.line('100%', '10px')}
 {shapes.line('80%', '10px')}
 {shapes.line('90%', '10px')}
 </div>
 </div>
)

// Stat card skeleton
export const SkeletonStat = ({ className }) => (
 <div className={cn('glass-card-static p-5 space-y-3', className)}>
 {shapes.circle('32px')}
 {shapes.line('50%', '24px')}
 {shapes.line('70%', '10px')}
 </div>
)

// Table row skeleton
export const SkeletonRow = ({ cols = 5, className }) => (
 <div className={cn('flex items-center gap-4 p-4 border-b border-white/[0.04]', className)}>
 {Array.from({ length: cols }).map((_, i) => (
 <div key={i} className="flex-1">
 {shapes.line(`${60 + Math.random() * 30}%`, '12px')}
 </div>
 ))}
 </div>
)

// Player card skeleton
export const SkeletonPlayerCard = ({ className }) => (
 <div className={cn('glass-card-static p-5 space-y-4', className)}>
 <div className="flex items-center gap-4">
 {shapes.circle('56px')}
 <div className="flex-1 space-y-2">
 {shapes.line('70%', '16px')}
 {shapes.line('40%', '10px')}
 </div>
 </div>
 {shapes.rect('100%', '60px')}
 <div className="grid grid-cols-3 gap-2">
 {shapes.line('100%', '32px')}
 {shapes.line('100%', '32px')}
 {shapes.line('100%', '32px')}
 </div>
 </div>
)

// Chart skeleton
export const SkeletonChart = ({ className, height = '200px' }) => (
 <div className={cn('glass-card-static p-6', className)}>
 <div className="space-y-3 mb-4">
 {shapes.line('30%', '16px')}
 {shapes.line('50%', '10px')}
 </div>
 {shapes.rect('100%', height)}
 </div>
)

const SkeletonLoader = { SkeletonCard, SkeletonStat, SkeletonRow, SkeletonPlayerCard, SkeletonChart }
export default SkeletonLoader
