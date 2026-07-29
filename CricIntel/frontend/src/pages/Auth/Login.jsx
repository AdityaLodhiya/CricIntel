import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'
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
          if (errData.detail.toLowerCase().includes('no active account')) {
            toast.error('Incorrect email or password.')
          } else {
            toast.error(errData.detail)
          }
        } else if (errData.message) {
          toast.error(errData.message)
        } else {
          toast.error('Login failed. Please check your credentials.')
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
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-15%] w-[50vw] h-[50vw] bg-primary/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[40vw] h-[40vw] bg-accent/8 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] transition-all duration-300">
              <span className="relative flex items-center justify-center h-full text-black font-black text-lg">C</span>
            </div>
            <span className="text-3xl font-space font-bold tracking-tight text-white">
              Cric<span className="text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]">Intel</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
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
