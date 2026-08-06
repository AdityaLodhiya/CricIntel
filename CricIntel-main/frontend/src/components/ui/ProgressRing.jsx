import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  color = '#3B82F6',
  label = '',
  sublabel = '',
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Ring */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        <circle
          className="text-white/[0.05]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Ring */}
        <motion.circle
          className="drop-shadow-[0_0_10px_currentColor]"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-2xl font-space font-black text-white">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1">{sublabel}</span>}
      </div>
    </div>
  )
}

export default ProgressRing
