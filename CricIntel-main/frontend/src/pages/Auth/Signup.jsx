import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AnimatedInput from '@/components/ui/AnimatedInput'
import GlowButton from '@/components/ui/GlowButton'
import GlassCard from '@/components/ui/GlassCard'
import api from '@/services/api'

const signupSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")
})

const Signup = () => {
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register/', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password
      })
      
      toast.success('Account created! Check your email for OTP.')
      navigate('/verify-otp', { state: { email: data.email } })
    } catch (error) {
      const errData = error.response?.data
      if (errData) {
        if (Array.isArray(errData.email)) {
          toast.error(errData.email[0])
        } else if (Array.isArray(errData.password)) {
          toast.error(errData.password[0])
        } else if (errData.message) {
          toast.error(errData.message)
        } else {
          toast.error('Signup failed. Please check your details.')
        }
      } else {
        toast.error('Network error. Please try again later.')
      }
    }
  }

  const onInvalid = (errors) => {
    if (errors.first_name) toast.error(errors.first_name.message)
    else if (errors.last_name) toast.error(errors.last_name.message)
    else if (errors.email) toast.error(errors.email.message)
    else if (errors.password) toast.error(errors.password.message)
    else if (errors.confirm_password) toast.error(errors.confirm_password.message)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-inter">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-accent/12 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-15%] w-[40vw] h-[40vw] bg-primary/8 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] transition-all duration-300">
              <span className="relative flex items-center justify-center h-full text-black font-black text-lg">C</span>
            </div>
            <span className="text-3xl font-space font-bold tracking-tight text-white">
              Cric<span className="text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]">Intel</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-gray-500 text-sm">Join the next generation of cricket analytics</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <AnimatedInput
                label="First Name"
                type="text"
                icon={User}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <AnimatedInput
                label="Last Name"
                type="text"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <AnimatedInput
              label="Email Address"
              type="email"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            
            <AnimatedInput
              label="Password"
              type="password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <p className="text-[11px] text-gray-600 leading-relaxed">
              Must be 8+ characters with uppercase, number, and special character.
            </p>

            <GlowButton 
              type="submit" 
              className="w-full mt-2" 
              isLoading={isSubmitting}
            >
              Create Account
            </GlowButton>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Signup
