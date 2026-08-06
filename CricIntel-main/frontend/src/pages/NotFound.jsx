import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import GlowButton from '@/components/ui/GlowButton'

const NotFound = () => {
 return (
 <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 font-inter">
 <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
 <AlertTriangle size={48} className="text-red-500" />
 </div>
 
 <h1 className="text-6xl md:text-8xl font-space font-black text-white tracking-tighter mb-4">404</h1>
 <h2 className="text-2xl font-bold text-gray-300 mb-6 uppercase tracking-widest">Signal Lost</h2>
 
 <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
 We couldn't find the data point you're looking for. It might have been moved or the URL is incorrect.
 </p>

 <Link to="/app">
 <GlowButton size="lg" className="rounded-xl px-8">
 <Home size={18} />
 Return to Dashboard
 </GlowButton>
 </Link>
 </div>
 )
}

export default NotFound
