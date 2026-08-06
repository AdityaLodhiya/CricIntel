import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AnimatedInput from '@/components/ui/AnimatedInput'
import GlowButton from '@/components/ui/GlowButton'
import GlassCard from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

const loginSchema = z.object({
 email: z.string().email("Please enter a valid email address"),
 password: z.string().min(6, "Password must be at least 6 characters")
})

const Login = () => {
 const navigate = useNavigate()
 const { login } = useAuthStore()
 
 const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
 resolver: zodResolver(loginSchema)
 })

 const onSubmit = async (data) => {
 try {
 const response = await api.post('/auth/login/', {
 email: data.email,
 password: data.password
 })
 
 if (response.data?.requires_otp) {
   toast.success(response.data.message || 'OTP sent! Please verify your email.')
   navigate('/verify-otp', { state: { email: data.email } })
   return
 }
 
 const { access, refresh } = response.data

 // After getting tokens, fetch user profile
 const userResponse = await api.get('/auth/me/', {
 headers: { Authorization: `Bearer ${access}` }
 })

 login(userResponse.data, access, refresh)
 
 toast.success(`Welcome back, ${userResponse.data.first_name || 'User'}!`)
 navigate('/app')
 } catch (error) {
    const errData = error.response?.data
    if (errData) {
      if (errData.detail) {
        if (errData.detail.toLowerCase().includes('no active account') || errData.detail.toLowerCase().includes('unable to log in')) {
          toast.error('Incorrect email or password.')
        } else {
          toast.error('Incorrect email or password.')
        }
      } else if (errData.message) {
        toast.error(errData.message)
      } else {
        toast.error('Incorrect email or password.')
      }
    } else {
      toast.error('Network error. Please try again later.')
    }
  }
 }

 const onInvalid = (errors) => {
 if (errors.email) toast.error(errors.email.message)
 else if (errors.password) toast.error(errors.password.message)
 }

 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-inter">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-[420px] relative z-10"
 >
 {/* Logo */}
 <div className="text-center mb-10">
 <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
 <div className="relative w-10 h-10 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center ">
 <span className="text-black font-black text-lg">C</span>
 </div>
 <span className="text-3xl font-space font-bold text-white tracking-tight">
 Cric<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">Intel</span>
 </span>
 </Link>
 <h2 className="text-3xl font-space font-black text-white mb-2">Welcome back</h2>
 <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
 </div>

 <GlassCard>
 <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
 <AnimatedInput
 label="Email Address"
 type="email"
 icon={Mail}
 error={errors.email?.message}
 {...register('email')}
 />
 
 <div className="space-y-1.5">
 <AnimatedInput
 label="Password"
 type="password"
 icon={Lock}
 error={errors.password?.message}
 {...register('password')}
 />
 <div className="flex justify-end">
 <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-primary transition-colors">
 Forgot password?
 </Link>
 </div>
 </div>

 <GlowButton 
 type="submit" 
 className="w-full mt-2" 
 isLoading={isSubmitting}
 >
 Sign In
 </GlowButton>
 </form>

 <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-gray-500">
 Don't have an account?{' '}
 <Link to="/signup" className="text-primary font-semibold hover:text-white transition-colors">
 Create one
 </Link>
 </div>
 </GlassCard>
 </motion.div>
 </div>
 )
}

export default Login
