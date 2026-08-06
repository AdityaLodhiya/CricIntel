import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/utils/cn'

const AnimatedCounter = ({ 
 value, 
 duration = 2, 
 prefix = '', 
 suffix = '', 
 decimals = 0,
 className = ''
}) => {
 const ref = useRef(null)
 const isInView = useInView(ref, { once: true, margin: "-20px" })
 
 // Start from 0, go up to `value`
 const motionValue = useSpring(0, {
 duration: duration * 1000,
 bounce: 0,
 })

 useEffect(() => {
 if (isInView) {
 // If value is a string with non-numeric chars (like "2.4K+"), handle it differently or strip
 // We'll assume `value` is a pure number for the animation, or we parse it
 const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value
 motionValue.set(numericValue || 0)
 }
 }, [isInView, value, motionValue])

 const rounded = useTransform(motionValue, (latest) => 
 latest.toFixed(decimals)
 )

 return (
 <motion.span ref={ref} className={cn("font-space tabular-nums font-black", className)}>
 {prefix}
 <motion.span>{rounded}</motion.span>
 {suffix}
 </motion.span>
 )
}

export default AnimatedCounter
