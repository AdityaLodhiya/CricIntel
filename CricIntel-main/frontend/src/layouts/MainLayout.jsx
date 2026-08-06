import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthStore } from '@/store/authStore'

// ErrorBoundary to prevent black screens on crash
class ErrorBoundary extends React.Component {
 constructor(props) {
  super(props)
  this.state = { hasError: false, error: null }
 }
 static getDerivedStateFromError(error) {
  return { hasError: true, error }
 }
 componentDidCatch(error, info) {
  console.error('ErrorBoundary caught:', error, info)
 }
 render() {
  if (this.state.hasError) {
   return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
     <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
      <span className="text-3xl">⚠️</span>
     </div>
     <h2 className="text-2xl font-space font-black text-white mb-2">Something went wrong</h2>
     <p className="text-sm text-gray-400 mb-6 max-w-md">An unexpected error occurred while rendering this page. Please try navigating back or refreshing.</p>
     <button 
      onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/app' }}
      className="px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary rounded-xl text-primary font-bold transition-all"
     >
      Go to Dashboard
     </button>
    </div>
   )
  }
  return this.props.children
 }
}

const MainLayout = () => {
 const location = useLocation()
 const { isAuthenticated } = useAuthStore()

 return (
 <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
 {/* Global Ambient Background */}
 <div className="fixed inset-0 z-0 pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-float" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
 </div>

 <Navbar />

 <main className="flex-grow relative z-10">
 {/* If authenticated, add top padding to account for the ticker ribbon */}
 <div className={`mx-auto w-full ${isAuthenticated ? 'pt-28' : 'pt-20'} pb-12`}>
 <AnimatePresence mode="wait">
 <motion.div
 key={location.pathname}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.3, ease: 'easeOut' }}
 className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto"
 >
 <ErrorBoundary key={location.pathname}>
  <Outlet />
 </ErrorBoundary>
 </motion.div>
 </AnimatePresence>
 </div>
 </main>

 <div className="relative z-10 mt-auto">
 <Footer />
 </div>
 </div>
 )
}

export default MainLayout

