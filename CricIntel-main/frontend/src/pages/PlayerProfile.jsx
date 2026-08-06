import React, { useState, useEffect } from 'react'
import { User, Activity, TrendingUp, Target, Crosshair, ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'
import { getFlagUrl } from '@/utils/constants'
import api from '@/services/api'

const PlayerProfile = () => {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('T20')
  const [liveStats, setLiveStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    let active = true
    if (playerId) {
      api.get(`/players/${playerId}/`)
        .then(res => {
          if (active && res.data) {
            setPlayer(res.data)
          }
        })
        .catch(err => {
          console.error("Failed to fetch player details:", err)
        })
    }
    return () => { active = false }
  }, [playerId])

  useEffect(() => {
    let active = true
    if (playerId) {
      setLoadingStats(true)
      api.get(`/players/${playerId}/stats/`, { params: { format: selectedFormat } })
        .then(res => {
          if (active && res.data?.stats) {
            setLiveStats(res.data.stats)
          } else {
            if (active) setLiveStats(null)
          }
        })
        .catch(() => {
          if (active) setLiveStats(null)
        })
        .finally(() => { if (active) setLoadingStats(false) })
    }
    return () => { active = false }
  }, [playerId, selectedFormat])

  if (!player) {
    return (
      <div className="pb-20 font-inter space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 font-space text-lg">Loading player profile...</div>
      </div>
    )
  }

  // Stats from backend liveStats, with safe fallbacks
  const stats = liveStats || {
    runs: player.runs || 0,
    avg: player.average || 0,
    batAvg: player.average || 0,
    sr: player.strikeRate || 0,
    wickets: player.wickets || 0,
    bowlAvg: 0,
    eco: player.economy || 0,
    matches: player.matches || 0,
  }

  // Radar data derived from backend player response
  const radarData = player.radarData || [
    { subject: 'Consistency', A: Math.min(100, Math.round((parseFloat(stats.avg || stats.batAvg || 0)) * 2)), fullMark: 100 },
    { subject: 'Strike Rate', A: Math.min(100, Math.round(parseFloat(stats.sr || 0) / 1.5)), fullMark: 100 },
    { subject: 'Form', A: 75, fullMark: 100 },
    { subject: 'Versatility', A: 80, fullMark: 100 },
    { subject: 'Clutch', A: 85, fullMark: 100 },
  ]

  // Performance chart: use recentScores from player object if available
  const performanceData = (player.recentScores || [45, 82, 12, 104, 55, 30]).map((v, i) => ({
    match: `M${i + 1}`,
    runs: typeof v === 'number' ? v : parseFloat(v) || 0,
    wickets: 0,
  }))

  return (
    <div className="pb-20 font-inter space-y-8">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-bold uppercase tracking-widest">Back to Prediction</span>
      </button>

      <PageHeader 
        title={`${player.name} (${player.gender || ''})`}
        description={`Detailed analytics and performance trends for ${player.country || player.team}'s ${(player.role || '').toLowerCase()}.`}
        icon={User}
        breadcrumbs={[
          { label: 'Players', to: '/app/analytics' },
          { label: player.name }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Column: Profile Card & Radar */}
 <div className="space-y-8 lg:col-span-1">
 <GlassCard className="p-6 overflow-hidden relative">
 <div className={cn(
 "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2",
 player.role === 'Batter' ? 'bg-blue-500' : 
 player.role === 'Bowler' ? 'bg-red-500' : 'bg-sky-500'
 )}></div>
 <div className="flex flex-col items-center text-center relative z-10">
 <div className={cn(
  "w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 overflow-hidden shadow-lg bg-black/50",
  player.role === 'Batter' ? 'border-blue-500' : 
  player.role === 'Bowler' ? 'border-red-500' : 
  'border-sky-500'
 )}>
  <img 
    src={getFlagUrl(player.team || player.country)} 
    alt={player.team || player.country} 
    className="w-full h-full object-cover"
  />
 </div>
 <h2 className="text-2xl font-space font-black text-white">{player.name}</h2>
 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">{player.team || player.country} • {player.role}</p>
 </div>

 <div className="mt-8">
 <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Player Attributes</h3>
 <div className="h-[250px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
 <PolarGrid stroke="rgba(255,255,255,0.1)" />
 <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
 <Radar name={player.name} dataKey="A" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.2} />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </GlassCard>
 </div>

 {/* Right Column: Stats & Charts */}
 <div className="lg:col-span-2 space-y-8">
 
 {/* Format Selector */}
 <GlassCard className="p-2 flex gap-2">
 {['Test', 'ODI', 'T20'].map(fmt => (
 <button
 key={fmt}
 onClick={() => setSelectedFormat(fmt)}
 disabled={Array.isArray(player.format) ? !player.format.includes(fmt) : player.format !== fmt}
 className={cn(
 "flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all",
 selectedFormat === fmt 
 ? "bg-primary text-black " 
 : (Array.isArray(player.format) ? !player.format.includes(fmt) : player.format !== fmt)
 ? "bg-transparent text-gray-700 cursor-not-allowed"
 : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
 )}
 >
 {fmt}
 </button>
 ))}
 </GlassCard>

 {/* Stat Grid */}
 <AnimatePresence mode="wait">
 <motion.div 
 key={selectedFormat}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="grid grid-cols-2 md:grid-cols-4 gap-4"
 >
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Matches</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.matches || player.matches || '—')}</p>
 </GlassCard>
 
 {(player.role === 'Batter' || player.role === 'All-Rounder' || player.role === 'Wicket-Keeper' || player.role === 'Allrounder' || player.role === 'Batting Allrounder' || player.role === 'Wicketkeeper') && (
 <>
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Runs</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.runs || player.runs || '—')}</p>
 </GlassCard>
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Bat Avg</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.batAvg || stats.avg || player.average || '—')}</p>
 </GlassCard>
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Strike Rate</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.sr || player.strikeRate || '—')}</p>
 </GlassCard>
 </>
 )}

 {(player.role === 'Bowler' || player.role === 'All-Rounder' || player.role === 'Allrounder' || player.role === 'Bowling Allrounder') && (
 <>
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Wickets</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.wickets || player.wickets || '—')}</p>
 </GlassCard>
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Bowl Avg</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.bowlAvg || stats.avg || '—')}</p>
 </GlassCard>
 <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Economy</p>
 <p className="text-2xl font-space font-black text-white">{loadingStats ? '...' : (stats.eco || stats.economy || player.economy || '—')}</p>
 </GlassCard>
 </>
 )}
 </motion.div>
 </AnimatePresence>

 {/* Performance Chart */}
 <GlassCard className="p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-space font-black text-white flex items-center gap-2">
 <TrendingUp size={18} className="text-primary" />
 Recent Performance
 </h3>
 </div>
 <div className="h-[300px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={performanceData}>
 <defs>
 <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis dataKey="match" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
 <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
 <Tooltip 
 contentStyle={{ backgroundColor: 'rgba(10,11,16,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
 itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
 />
 <Area type="monotone" dataKey="runs" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRuns)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </GlassCard>

 {/* Vs Opponent Record — using backend stats */}
 <GlassCard variant="purple" className="p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-space font-black text-white flex items-center gap-2">
 <Crosshair size={18} className="text-purple-400" />
 Career Stats ({selectedFormat})
 </h3>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
   {[
     { label: 'Career Runs', value: player.runs || stats.runs || '—' },
     { label: 'Career Avg', value: player.average || stats.avg || stats.batAvg || '—' },
     { label: 'Strike Rate', value: player.strikeRate || stats.sr || '—' },
     { label: 'Career Wkts', value: player.wickets || stats.wickets || '—' },
     { label: 'Economy', value: player.economy || stats.eco || '—' },
     { label: 'Last 5 Runs', value: stats.last5_runs || '—' },
   ].map(item => (
     <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
       <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{item.label}</div>
       <div className="text-lg font-space font-black text-white">{loadingStats ? '...' : item.value}</div>
     </div>
   ))}
 </div>
 </GlassCard>

 </div>
 </div>
 </div>
  )
}

export default PlayerProfile
