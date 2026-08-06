import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Brain, Users, Zap, MapPin } from 'lucide-react'
import { cn } from '@/utils/cn'

import { useNavigate } from 'react-router-dom'

const BroadcastPlayerCard = ({ player, index, delay, isAway }) => {
  const navigate = useNavigate();
  return (
  <motion.div
  onClick={() => navigate(`/app/player/${player.id}`)}
  initial={{ opacity: 0, x: isAway ? 50 : -50, skewX: -10 }}
  animate={{ opacity: 1, x: 0, skewX: 0 }}
  transition={{ delay: delay, duration: 0.6, type: 'spring', bounce: 0.3 }}
  className="relative w-full mb-4 group cursor-pointer"
  >
  {/* Broadcast Graphics Base */}
  <div className={cn(
    "relative bg-gradient-to-r border overflow-hidden shadow-2xl flex flex-col transition-all rounded-r-xl",
    isAway 
      ? "from-[#1a1128] to-[#2d1b4e] border-purple-500/20 hover:border-purple-500/50" 
      : "from-[#0a192f] to-[#112240] border-blue-500/20 hover:border-blue-500/50"
  )}>
  
  {/* Animated Sweep Effect */}
  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

  {/* Role Accent color block (Angular) */}
  <div className={cn(
  "absolute left-0 top-0 bottom-0 w-2 z-10",
  player.role === 'Batter' ? 'bg-blue-500 shadow-[0_0_10px_blue]' : 
  player.role === 'Bowler' ? 'bg-red-500 shadow-[0_0_10px_red]' : 
  player.role === 'All-Rounder' ? 'bg-sky-500 shadow-[0_0_10px_#0ea5e9]' : 'bg-yellow-500 shadow-[0_0_10px_yellow]'
  )} />

  {/* Top Section: Name and Role */}
  <div className={cn(
    "flex items-center justify-between px-6 py-3 z-10 border-b border-white/5",
    isAway ? "flex-row-reverse" : "flex-row"
  )}>
    <div className={cn("flex items-center gap-4", isAway && "flex-row-reverse")}>
      <div className="text-2xl font-space font-black text-white opacity-20">
        {index + 1}
      </div>
      <div className={isAway ? "text-right" : "text-left"}>
        <h4 className="font-space font-black text-lg text-white uppercase tracking-wide leading-none group-hover:text-primary transition-colors">{player.name}</h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{player.role}</p>
      </div>
    </div>
    
    <div className={cn(
      "bg-black/80 px-4 py-2 rounded border",
      isAway ? "border-purple-500/30" : "border-blue-500/30"
    )}>
      <div className="text-xl font-black text-primary font-space leading-none text-center">{player.ai_score || '9.2'}</div>
      <div className="text-[8px] text-gray-500 uppercase tracking-widest text-center mt-1">Impact Score</div>
    </div>
  </div>

  {/* Bottom Section: SHAP Analytics */}
  <div className={cn(
    "px-6 py-3 z-10 bg-black/20 flex flex-col md:flex-row gap-4 justify-between items-center",
    isAway && "md:flex-row-reverse text-right"
  )}>
    {player.reason && (
      <div className="flex-1">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">SHAP Analyst Note</p>
        <p className="text-xs text-gray-300 italic">"{player.reason}"</p>
      </div>
    )}
    
    <div className={cn("flex gap-6", isAway && "flex-row-reverse")}>
      <div className="text-center">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Recent Form</p>
        <p className="text-sm font-bold text-white">{player.recent_form || 'Good'}</p>
      </div>
      <div className="text-center">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vs Opponent</p>
        <p className="text-sm font-bold text-white">Dominant</p>
      </div>
    </div>
  </div>

  </div>
  </motion.div>
  )
}

const PlayingXIReveal = ({ homeXI, awayXI, matchDetails }) => {
  const [revealed, setRevealed] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  
  if (!homeXI || !awayXI || homeXI.length === 0 || awayXI.length === 0) return null

  const activeTeam = activeTab === 'home' ? homeXI : awayXI

  return (
  <div className="space-y-8">
  {!revealed ? (
  <motion.div 
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="flex flex-col items-center justify-center py-24 bg-gradient-to-b from-[#0a0a0f] to-[#050508] rounded-3xl border border-primary/20 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]"
  >
  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.2] mix-blend-overlay"></div>
  
  <div className="relative">
    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
    <Brain size={56} className="text-primary mb-6 relative z-10 animate-bounce" />
  </div>
  <h3 className="text-3xl font-space font-black text-white mb-3 tracking-tight text-center">Prediction Models Converged</h3>
  <p className="text-sm text-gray-400 mb-10 max-w-lg text-center leading-relaxed">
  Analyzed {matchDetails?.venue || 'venue'} pitch conditions, head-to-head records, and current form to generate the optimal lineups for both {matchDetails?.homeTeam} and {matchDetails?.awayTeam}.
  </p>
  <button 
  onClick={() => setRevealed(true)}
  className="relative px-10 py-4 bg-primary/10 hover:bg-primary/20 border border-primary rounded-xl text-primary font-space font-black tracking-widest uppercase overflow-hidden group transition-all shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] hover:scale-105"
  >
  <span className="relative z-10 flex items-center gap-2">
    <Zap size={18} />
    Reveal Broadcast XI
  </span>
  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
  </button>
  </motion.div>
  ) : (
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-[#050508]/80 backdrop-blur-xl p-4 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
  >
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />

  {/* Broadcast Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-6">
  <div>
  <h3 className="text-3xl md:text-4xl font-space font-black text-white flex items-center gap-3 uppercase tracking-tight">
  <Users className="text-primary" size={36} />
  Predicted Lineups
  </h3>
  <p className="text-xs md:text-sm text-primary uppercase tracking-widest mt-2 font-bold flex items-center gap-2">
    <MapPin size={14} /> {matchDetails?.venue || "Today's Match"}
  </p>
  </div>
  
  {/* Legend */}
  <div className="flex flex-wrap gap-2 md:gap-3">
  <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase text-[10px] md:text-xs rounded flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full" /> Batter
  </span>
  <span className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold uppercase text-[10px] md:text-xs rounded flex items-center gap-2">
    <div className="w-2 h-2 bg-sky-500 rounded-full" /> All-Rounder
  </span>
  <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase text-[10px] md:text-xs rounded flex items-center gap-2">
    <div className="w-2 h-2 bg-red-500 rounded-full" /> Bowler
  </span>
  </div>
  </div>

  {/* Team Tabs */}
  <div className="flex p-1 bg-black/50 border border-white/5 rounded-xl mb-8 w-full max-w-md mx-auto relative z-10">
    <button
      onClick={() => setActiveTab('home')}
      className={cn(
        "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-lg transition-all",
        activeTab === 'home' ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "text-gray-400 hover:text-white"
      )}
    >
      {matchDetails?.homeTeam}
    </button>
    <button
      onClick={() => setActiveTab('away')}
      className={cn(
        "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-lg transition-all",
        activeTab === 'away' ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" : "text-gray-400 hover:text-white"
      )}
    >
      {matchDetails?.awayTeam}
    </button>
  </div>

  <div className="grid grid-cols-1 gap-2 max-w-3xl mx-auto">
  <AnimatePresence mode="wait">
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {activeTeam.map((player, idx) => (
      <BroadcastPlayerCard 
      key={player.id || player.name || idx} 
      player={player} 
      index={idx} 
      delay={idx * 0.1} 
      isAway={activeTab === 'away'}
      />
      ))}
    </motion.div>
  </AnimatePresence>
  </div>
  </motion.div>
  )}
  </div>
  )
}

export default PlayingXIReveal
