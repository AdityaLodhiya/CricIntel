import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'

const AnimatedInput = React.forwardRef(({ 
 label, 
 error, 
 icon: Icon,
 className,
 type = 'text',
 ...props 
}, ref) => {
 const [isFocused, setIsFocused] = useState(false)
 const [showPassword, setShowPassword] = useState(false)

 const isPasswordField = type === 'password'
 const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type

 return (
 <div className={cn("relative w-full", className)}>
 <motion.label
 initial={false}
 animate={{
 y: isFocused || props.value || props.defaultValue ? -24 : 12,
 scale: isFocused || props.value || props.defaultValue ? 0.85 : 1,
 color: error ? '#EF4444' : isFocused ? '#3B82F6' : '#A1A1AA'
 }}
 className={cn(
 "absolute left-4 z-10 origin-left pointer-events-none transition-colors text-sm",
 Icon ? "left-11" : "left-4"
 )}
 >
 {label}
 </motion.label>
 
 <div className="relative flex items-center">
 {Icon && (
 <div className={cn(
 "absolute left-4 transition-colors duration-200",
 error ? "text-red-500" : isFocused ? "text-primary" : "text-muted"
 )}>
 <Icon size={18} />
 </div>
 )}
 <input
 ref={ref}
 type={inputType}
 onFocus={() => setIsFocused(true)}
 onBlur={(e) => {
 if (!e.target.value) setIsFocused(false)
 }}
 className={cn(
 "w-full bg-[#18181B]/80 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm",
 Icon ? "pl-11" : "pl-4",
 isPasswordField ? "pr-11" : "pr-4",
 error && "border-red-500/60 focus:ring-red-500/30 focus:border-red-500/60"
 )}
 {...props}
 />

 {/* Password visibility toggle */}
 {isPasswordField && (
 <button
 type="button"
 tabIndex={-1}
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 text-muted hover:text-white transition-colors focus:outline-none"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 )}
 </div>
 
 {error && (
 <motion.p 
 initial={{ opacity: 0, y: -5 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"
 >
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
 {error}
 </motion.p>
 )}
 </div>
 )
})

AnimatedInput.displayName = 'AnimatedInput'

export default AnimatedInput
