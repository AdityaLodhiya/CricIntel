import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import GlowButton from '@/components/ui/GlowButton'
import GlassCard from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

const VerifyOTP = () => {
 const location = useLocation()
 const navigate = useNavigate()
 const { login } = useAuthStore()
 
 const email = location.state?.email || ''
 
 const [otp, setOtp] = useState(['', '', '', '', '', ''])
 const [timeLeft, setTimeLeft] = useState(120)  // 2 minutes to match backend OTP expiry
 const [isVerifying, setIsVerifying] = useState(false)

 const inputRefs = useRef([])

 useEffect(() => {
 if (!email) {
 navigate('/signup')
 }
 }, [email, navigate])

 useEffect(() => {
 if (timeLeft > 0) {
 const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
 return () => clearTimeout(timer)
 }
 }, [timeLeft])

 const handleChange = (e, index) => {
 const value = e.target.value
 if (isNaN(value)) return

 const newOtp = [...otp]
 newOtp[index] = value.substring(value.length - 1)
 setOtp(newOtp)

 if (value && index < 5) {
 inputRefs.current[index + 1].focus()
 }

 if (newOtp.every(v => v !== '')) {
 handleVerify(newOtp.join(''))
 }
 }

 const handleKeyDown = (e, index) => {
 if (e.key === 'Backspace' && !otp[index] && index > 0) {
 inputRefs.current[index - 1].focus()
 }
 }

 const handlePaste = (e) => {
 e.preventDefault()
 const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('')
 if (pastedData.some(isNaN)) return

 const newOtp = [...otp]
 pastedData.forEach((char, index) => {
 if (index < 6) newOtp[index] = char
 })
 setOtp(newOtp)
 
 const lastIndex = Math.min(pastedData.length, 5)
 inputRefs.current[lastIndex].focus()

 if (newOtp.every(v => v !== '')) {
 handleVerify(newOtp.join(''))
 }
 }

 const handleVerify = async (otpString) => {
 if (otpString.length !== 6) return
 setIsVerifying(true)
 
 try {
 const response = await api.post('/auth/verify-otp/', { 
 email, 
 otp: otpString 
 })
 
 toast.success('Email verified successfully!')
 
 const { tokens, user } = response.data
 login(user, tokens.access, tokens.refresh)
 
 navigate('/app')
 } catch (error) {
 const msg = error.response?.data?.message || 'Invalid OTP code. Please try again.'
 toast.error(msg)
 setOtp(['', '', '', '', '', ''])
 inputRefs.current[0]?.focus()
 } finally {
 setIsVerifying(false)
 }
 }

 const handleResend = async () => {
 if (timeLeft > 0) return
 try {
 await api.post('/auth/resend-otp/', { email })
 setTimeLeft(60)
 toast.success('New OTP sent to your email')
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to resend OTP')
 }
 }

 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-inter">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-[420px] relative z-10"
 >
 <div className="text-center mb-10">
 <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
 <div className="relative w-10 h-10 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center ">
 <span className="text-black font-black text-lg">C</span>
 </div>
 <span className="text-3xl font-space font-bold text-white tracking-tight">
 Cric<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">Intel</span>
 </span>
 </Link>

 {/* Email icon animation */}
 <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
 <motion.svg 
 animate={{ y: [0, -3, 0] }} 
 transition={{ repeat: Infinity, duration: 2 }}
 width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
 >
 <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
 </motion.svg>
 </div>

 <h2 className="text-2xl font-bold text-white mb-2">Verify your email</h2>
 <p className="text-gray-500 text-sm">Enter the 6-digit code sent to<br/><span className="text-white font-medium">{email}</span></p>
 </div>

 <GlassCard>
 <div className="flex justify-between gap-2.5 mb-8">
 {otp.map((digit, index) => (
 <input
 key={index}
 ref={el => inputRefs.current[index] = el}
 type="text"
 inputMode="numeric"
 maxLength={1}
 value={digit}
 onChange={e => handleChange(e, index)}
 onKeyDown={e => handleKeyDown(e, index)}
 onPaste={handlePaste}
 disabled={isVerifying}
 className="w-12 h-14 bg-[#18181B]/80 border border-white/10 rounded-xl text-center text-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
 />
 ))}
 </div>

 <GlowButton 
 className="w-full" 
 isLoading={isVerifying}
 onClick={() => handleVerify(otp.join(''))}
 disabled={otp.join('').length !== 6}
 >
 Verify & Continue
 </GlowButton>

 <div className="mt-8 text-center text-sm">
 <p className="text-gray-500 mb-2">Didn't receive the code?</p>
 {timeLeft > 0 ? (
 <p className="text-gray-600 flex items-center justify-center gap-2">
 Resend in 
 <span className="text-primary font-mono font-semibold tabular-nums">
 {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
 </span>
 </p>
 ) : (
 <button 
 onClick={handleResend}
 className="text-primary font-semibold hover:text-white transition-colors"
 >
 Resend Code
 </button>
 )}
 </div>
 </GlassCard>
 </motion.div>
 </div>
 )
}

export default VerifyOTP
