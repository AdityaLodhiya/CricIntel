import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, KeyRound } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AnimatedInput from '@/components/ui/AnimatedInput'
import GlowButton from '@/components/ui/GlowButton'
import GlassCard from '@/components/ui/GlassCard'
import api from '@/services/api'

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

const resetSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  new_password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
})

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [stage, setStage] = useState('email') // 'email' or 'reset'
  const [userEmail, setUserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(emailSchema)
  })

  const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm({
    resolver: zodResolver(resetSchema)
  })

  const onEmailSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/password-reset/', { email: data.email })
      setUserEmail(data.email)
      setStage('reset')
      toast.success('OTP has been sent to your email!')
    } catch (error) {
      const errData = error.response?.data
      if (errData?.message) {
        toast.error(errData.message)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onResetSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/password-reset-confirm/', {
        email: userEmail,
        otp: data.otp,
        new_password: data.new_password
      })
      toast.success(response.data.message || 'Password reset successfully!')
      navigate('/login')
    } catch (error) {
      const errData = error.response?.data
      if (errData?.message) {
        toast.error(errData.message)
      } else {
        toast.error('Failed to reset password. Please check your OTP.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onEmailInvalid = (errors) => {
    if (errors.email) toast.error(errors.email.message)
  }

  const onResetInvalid = (errors) => {
    if (errors.otp) toast.error(errors.otp.message)
    else if (errors.new_password) toast.error(errors.new_password.message)
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] transition-all duration-300">
              <span className="relative flex items-center justify-center h-full text-black font-black text-lg">C</span>
            </div>
            <span className="text-3xl font-space font-bold tracking-tight text-white">
              Cric<span className="text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]">Intel</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm">
            {stage === 'email' ? "Enter your email to receive a reset code" : "Enter the OTP and your new password"}
          </p>
        </div>

        <GlassCard>
          {stage === 'email' ? (
            <form onSubmit={handleEmailSubmit(onEmailSubmit, onEmailInvalid)} className="space-y-5">
              <AnimatedInput
                label="Email Address"
                type="email"
                icon={Mail}
                error={emailErrors.email?.message}
                {...registerEmail('email')}
              />
              <GlowButton type="submit" className="w-full mt-2" isLoading={isLoading}>
                Send Reset Code
              </GlowButton>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit(onResetSubmit, onResetInvalid)} className="space-y-5">
              <AnimatedInput
                label="6-Digit OTP"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '')
                }}
                icon={KeyRound}
                error={resetErrors.otp?.message}
                {...registerReset('otp')}
              />
              <AnimatedInput
                label="New Password"
                type="password"
                icon={Lock}
                error={resetErrors.new_password?.message}
                {...registerReset('new_password')}
              />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Must be 8+ characters with an uppercase letter and a number.
              </p>
              <GlowButton type="submit" className="w-full mt-2" isLoading={isLoading}>
                Reset Password
              </GlowButton>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
