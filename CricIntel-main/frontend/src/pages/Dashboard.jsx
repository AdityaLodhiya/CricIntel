import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, BarChart3, Calendar, Users, MapPin, Swords, TrendingUp, Activity, Globe, Trophy, X, ChevronRight, Brain } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import toast from 'react-hot-toast'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import api from '@/services/api'

const modules = [
 { title: 'Predict XI', subtitle: 'AI Playing XI generation', icon: Zap, linkTo: '/app/prediction', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', glow: '' },
 { title: 'Analytics', subtitle: 'SHAP values & dataset insights', icon: BarChart3, linkTo: '/app/analytics', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/20', glow: '' },
 { title: 'Matchups', subtitle: 'Head-to-head records', icon: Swords, linkTo: '/app/matchups', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20', glow: '' },
 { title: 'Fixtures', subtitle: 'Upcoming matches', icon: Calendar, linkTo: '/app/fixtures', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20', glow: '' },
 { title: 'Venues', subtitle: 'Pitch & weather intel', icon: MapPin, linkTo: '/app/venues', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
]

const IconMap = { Activity, Brain, Globe, MapPin, Swords, BarChart3, TrendingUp };

const Dashboard = () => {
 const navigate = useNavigate()
 const [recentPredictions, setRecentPredictions] = useState(null)
 const [aiInsights, setAiInsights] = useState(null)
 const [stats, setStats] = useState({
   players: null,
   venues: null,
   matches: null,
   accuracy: null,
 })

 useEffect(() => {
   let cancelled = false

   // Try to load real prediction history from backend
   api.get('/predict/').then(res => {
     if (cancelled) return
     const results = res.data?.results || []
     if (results.length > 0) {
       setRecentPredictions(results.slice(0, 3).map(p => ({
         match: `India vs ${p.opponent}`,
         format: p.format,
         result: p.playing_xi?.length > 0 ? 'AI Prediction Generated' : 'Pending',
         date: new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
         status: p.status === 'CMP' ? 'completed' : p.status === 'LIV' ? 'live' : 'pending',
       })))
     }
   }).catch(() => { /* backend may have no predictions yet */ })

   // Try to load player count from backend
   api.get('/players/').then(res => {
     if (cancelled) return
     const count = res.data?.count || (Array.isArray(res.data?.results) ? res.data.results.length : 0)
     setStats(s => ({ ...s, players: count }))
   }).catch(() => { setStats(s => ({ ...s, players: 'N/A' })) })

   // Try to load venue count from backend
   api.get('/venues/').then(res => {
     if (cancelled) return
     const venueData = res.data
     const count = Array.isArray(venueData)
       ? venueData.length
       : (venueData?.count || (Array.isArray(venueData?.results) ? venueData.results.length : 0))
     setStats(s => ({ ...s, venues: count }))
   }).catch(() => { setStats(s => ({ ...s, venues: 'N/A' })) })

   // Load accurate total matches from backend
   api.get('/matches/').then(res => {
     if (cancelled) return
     const count = res.data?.count || 0
     setStats(s => ({ ...s, matches: count }))
   }).catch(() => { setStats(s => ({ ...s, matches: 'N/A' })) })

   // Load real prediction analytics and insights from backend
   api.get('/analytics/dashboard/').then(res => {
     if (cancelled) return
     if (res.data?.insights) setAiInsights(res.data.insights)
     else setAiInsights([])
   }).catch(() => { setAiInsights([]) })

   // Load exact prediction accuracy from model metadata storage
   api.get('/analytics/model-info/').then(res => {
     if (cancelled) return
     const accuracy = res.data?.predictionAccuracy || 0
     setStats(s => ({ ...s, accuracy }))
   }).catch(() => { setStats(s => ({ ...s, accuracy: 'N/A' })) })

   return () => { cancelled = true }
 }, [])

 const quickStats = [
   { label: 'Prediction Accuracy', value: stats.accuracy, suffix: '%', icon: Activity, color: 'text-sky-400' },
   { label: 'Players in Dataset', value: stats.players, suffix: '+', icon: Users, color: 'text-[#3B82F6]' },
   { label: 'Venues Covered', value: stats.venues, suffix: '', icon: MapPin, color: 'text-[#8B5CF6]' },
   { label: 'Matches in Dataset', value: stats.matches, suffix: '+', icon: Trophy, color: 'text-[#F59E0B]' },
 ]

 return (
 <div className="space-y-8 font-inter">
 
 {/* Hero Banner */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="relative overflow-hidden rounded-[2rem] glass-panel p-10 md:p-12 shadow-glass-lg border-white/[0.08]"
 >
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.1] mix-blend-overlay"></div>
 
 <div className="relative z-10 max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-6">
 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
 System Online • XGBoost Models Active
 </div>
 
 <h1 className="text-4xl md:text-5xl font-space font-black text-white mb-4 leading-tight">
 Welcome to <span className="text-gradient-multi">CricIntel</span>
 </h1>
 <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8">
 Your command center for cricket intelligence. Deploy machine learning to predict optimal Playing XIs and decode match outcomes before the toss.
 </p>
 
 <GlowButton onClick={() => navigate('/app/prediction')} size="lg" className="rounded-2xl ">
 <Zap size={18} />
 Initialize Prediction
 </GlowButton>
 </div>
 </motion.div>

 {/* Quick Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
 {quickStats.map((stat, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.08 }}
 className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
 <stat.icon size={18} className={stat.color} />
 </div>
 <TrendingUp size={14} className="text-gray-600" />
 </div>
 {stat.value === null ? (
     <div className="h-9 w-24 bg-white/10 rounded animate-pulse mb-1"></div>
 ) : stat.value === 'N/A' ? (
     <p className="text-xl text-gray-500 font-bold mb-1">Unable to load data</p>
 ) : (
     <AnimatedCounter value={stat.value} suffix={stat.suffix} className="text-3xl text-white block mb-1" />
 )}
 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
 </motion.div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Modules Grid */}
 <div className="lg:col-span-2 space-y-5">
 <h2 className="section-label">Core Modules</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 {modules.map((mod, i) => (
 <GlassCard 
 key={i} 
 onClick={() => navigate(mod.linkTo)}
 className="group p-6 hover:-translate-y-1"
 >
 <div className={`w-12 h-12 rounded-2xl ${mod.bg} ${mod.border} border flex items-center justify-center mb-5 transition-shadow`}>
 <mod.icon size={24} className={mod.color} />
 </div>
 <h3 className="text-lg font-space font-bold text-white mb-1 group-hover:text-primary transition-colors">{mod.title}</h3>
 <p className="text-xs text-gray-400 leading-relaxed">{mod.subtitle}</p>
 </GlassCard>
 ))}
 </div>
 </div>

 {/* Sidebar */}
 <div className="space-y-5">
 <h2 className="section-label">Intelligence Feed</h2>
 
 <GlassCard className="p-0 overflow-hidden">
 <div className="p-5 border-b border-white/[0.04] bg-white/[0.02]">
 <h3 className="text-sm font-bold text-white">Recent Predictions</h3>
 </div>
 <div className="divide-y divide-white/[0.04]">
 {recentPredictions === null ? (
     [1, 2].map(i => (
        <div key={i} className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse mb-3"></div>
            <div className="h-2 w-1/3 bg-white/5 rounded animate-pulse mb-2"></div>
            <div className="h-2 w-1/4 bg-white/5 rounded animate-pulse"></div>
        </div>
     ))
 ) : recentPredictions.length > 0 ? recentPredictions.map((pred, i) => (
 <div key={i} className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className={`w-1.5 h-1.5 rounded-full ${pred.status === 'live' ? 'bg-primary animate-pulse' : 'bg-gray-600'}`} />
 <span className="text-xs font-bold text-white">{pred.match}</span>
 </div>
 <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{pred.format}</span>
 </div>
 <p className="text-xs text-gray-400 mb-2">{pred.result}</p>
 <p className="text-[10px] text-gray-600">{pred.date}</p>
 </div>
 )) : (
 <div className="p-8 text-center">
 <p className="text-xs text-gray-500 leading-relaxed">No predictions yet. Run the Predict XI engine to generate your first AI lineup.</p>
 </div>
 )}
 </div>
 <div className="p-4 border-t border-white/[0.04] bg-white/[0.01]">
 <button onClick={() => navigate('/app/prediction')} className="w-full text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
 Run New Prediction
 </button>
 </div>
 </GlassCard>

        <GlassCard className="p-0 overflow-hidden">
          <div className="p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center gap-2">
            <Brain size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">CricIntel Insights</h3>
          </div>
          <div className="p-5 space-y-4">
            {aiInsights === null ? (
              [1, 2, 3].map(i => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg shrink-0 bg-white/5 animate-pulse"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-3 w-20 bg-white/5 rounded animate-pulse block"></div>
                      <div className="h-8 w-full bg-white/5 rounded animate-pulse block"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : aiInsights.length > 0 ? (
                aiInsights.map((insight, i) => {
                  const IconComponent = IconMap[insight.icon] || Brain;
                  return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.01] p-4 group hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg shrink-0 ${insight.bg} flex items-center justify-center ${insight.color}`}>
                        <IconComponent size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">{insight.type}</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">"{insight.text}"</p>
                      </div>
                    </div>
                  </motion.div>
                )})
            ) : (
                <p className="text-xs text-gray-500 text-center py-4">Unable to load insights.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
 </div>
 )
}

export default Dashboard
