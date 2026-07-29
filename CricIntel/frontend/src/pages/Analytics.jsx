import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts'
import GlassCard from '@/components/ui/GlassCard'
import { useMatchStore } from '../store/matchStore'
import { SQUADS } from './Prediction/PlayingXIReveal'

const shapData = [
  { feature: 'Recent Form', importance: 0.28, color: '#00E676' },
  { feature: 'H2H Record', importance: 0.18, color: '#3B82F6' },
  { feature: 'Venue Average', importance: 0.15, color: '#8B5CF6' },
  { feature: 'Bowling SR', importance: 0.12, color: '#F59E0B' },
  { feature: 'Fitness Index', importance: 0.10, color: '#EF4444' },
  { feature: 'Team Balance', importance: 0.09, color: '#06B6D4' },
  { feature: 'Weather Impact', importance: 0.05, color: '#EC4899' },
  { feature: 'Toss Factor', importance: 0.03, color: '#6B7280' },
]

const winProbTimeline = [
  { over: '0', india: 50, opponent: 50 },
  { over: '10', india: 62, opponent: 38 },
  { over: '20', india: 65, opponent: 35 },
  { over: '30', india: 68, opponent: 32 },
  { over: '40', india: 75, opponent: 25 },
  { over: '50', india: 73, opponent: 27 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0C]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <span className="text-[10px] font-medium text-gray-300">{entry.name}</span>
            <span className="text-sm font-black" style={{ color: entry.color || entry.fill }}>{typeof entry.value === 'number' ? entry.value.toFixed?.(1) ?? entry.value : entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const ChartHeader = ({ title, subtitle }) => (
  <div className="mb-5 border-b border-white/5 pb-3">
    <h3 className="text-sm font-space font-bold text-white uppercase tracking-wider">{title}</h3>
    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
  </div>
)

const WinProbGauge = ({ homeWin = 73, homeName = 'India', awayName = 'Australia' }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
        <circle
          cx="100" cy="100" r="85" fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${homeWin * 5.34} ${534 - homeWin * 5.34}`}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-space font-black text-white">{homeWin}%</span>
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{homeName}</span>
      </div>
    </div>
    <div className="flex items-center gap-4 text-[10px] font-bold">
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00E676]" /><span className="text-gray-400">{homeName}: {homeWin}%</span></div>
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-600" /><span className="text-gray-400">{awayName}: {100 - homeWin}%</span></div>
    </div>
  </div>
)

const Analytics = () => {
  const request = useMatchStore()
  const { homeTeam, awayTeam, format, gender } = request

  // Fake home win prob
  const seed = homeTeam.length + awayTeam.length
  const homeWin = Math.min(Math.max(50 + (homeTeam.length - awayTeam.length) * 3 + (seed % 10), 10), 90)

  // Get active squads
  const homeSquad = SQUADS[gender]?.[homeTeam]?.[format]?.xi || []
  const awaySquad = SQUADS[gender]?.[awayTeam]?.[format]?.xi || []
  
  const allPlayers = useMemo(() => {
    return [
      ...homeSquad.map(p => ({ ...p, team: homeTeam })),
      ...awaySquad.map(p => ({ ...p, team: awayTeam }))
    ]
  }, [homeSquad, awaySquad, homeTeam, awayTeam])

  const [selectedPlayer, setSelectedPlayer] = useState(allPlayers[0])

  // Change selected player if match context changes and old player not found
  React.useEffect(() => {
    if (allPlayers.length > 0 && !allPlayers.find(p => p.name === selectedPlayer?.name)) {
      setSelectedPlayer(allPlayers[0])
    }
  }, [allPlayers, selectedPlayer])

  // Generate dynamic stats for selected player
  const playerStats = useMemo(() => {
    if (!selectedPlayer) return { history: [], mode: 'batting', roleDistribution: [] }
    const pSeed = selectedPlayer.name.length
    const isBatter = ['Batter', 'WK-Batter', 'All-Rounder'].includes(selectedPlayer.role)
    const isBowler = ['Bowler (Pace)', 'Bowler (Spin)', 'All-Rounder'].includes(selectedPlayer.role)
    
    // Default to batting if Batter/AR, Bowling if Bowler.
    const mode = isBatter ? 'batting' : 'bowling'
    
    const history = Array.from({ length: 6 }).map((_, i) => {
      if (mode === 'batting') {
        const runs = Math.floor(Math.random() * (format === 'T20' ? 80 : 150))
        return { match: `Match ${6-i}`, runs, sr: Math.floor(Math.random() * 50 + 100) }
      } else {
        const wickets = Math.floor(Math.random() * 5)
        return { match: `Match ${6-i}`, wickets, econ: (Math.random() * 4 + 4).toFixed(1) }
      }
    })

    const roleDistribution = [
      { name: 'Batters', value: homeSquad.filter(p=>p.role === 'Batter').length, color: '#3B82F6' },
      { name: 'WK', value: homeSquad.filter(p=>p.role === 'WK-Batter').length, color: '#F97316' },
      { name: 'All-Rounders', value: homeSquad.filter(p=>p.role === 'All-Rounder').length, color: '#8B5CF6' },
      { name: 'Bowlers', value: homeSquad.filter(p=>p.role.includes('Bowler')).length, color: '#EF4444' },
    ]

    return { history, mode, roleDistribution }
  }, [selectedPlayer, format, homeSquad])

  if (!selectedPlayer) return null

  return (
    <div className="space-y-8 pb-12 font-inter max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00E676]/10 via-blue-900/20 to-purple-900/20 border border-white/[0.06] p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E676]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-space font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-tight mb-2">
              Analytics Hub
            </h1>
            <p className="text-sm text-gray-400 font-medium">Deep dive into performance metrics, SHAP feature importance, and AI model insights.</p>
          </div>
          <div className="flex gap-3 print-hidden">
            <button onClick={() => window.print()} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-[#00E676] text-xs font-bold text-white uppercase tracking-wider transition-all shadow-md">Export to PDF</button>
          </div>
        </div>
      </motion.div>

      {/* Win Probability + SHAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <GlassCard className="h-full p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl hover:border-[#00E676]/20 transition-colors">
            <ChartHeader title="Win Probability" subtitle="Predicted match outcome" />
            <WinProbGauge homeWin={homeWin} homeName={homeTeam} awayName={awayTeam} />
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard className="h-full p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl hover:border-blue-500/20 transition-colors">
            <ChartHeader title="SHAP Feature Importance" subtitle="What influenced the prediction most" />
            <div className="space-y-2.5">
              {shapData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 font-semibold w-24 text-right truncate">{item.feature}</span>
                  <div className="flex-1 h-4 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.importance * 100 / 0.28 * 100 / 100}%` }} transition={{ delay: i * 0.08, duration: 0.6 }} className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <span className="text-xs font-black text-white w-10 text-right">{(item.importance * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Player Selector UI */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="print-hidden">
        <h2 className="text-xl font-space font-bold text-white mb-4">Player Deep Dive</h2>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {allPlayers.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelectedPlayer(p)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlayer?.name === p.name 
                  ? 'bg-[#00E676] text-black border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'bg-[#0A0A0C] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {p.name} <span className="opacity-50 text-[10px] ml-1 uppercase">({p.team.substring(0,3)})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Selected Player Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
          <GlassCard className="h-full p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl hover:border-white/10 transition-colors">
            <ChartHeader title={`${selectedPlayer.name} - ${playerStats.mode === 'batting' ? 'Batting Form' : 'Bowling Form'}`} subtitle={`${playerStats.mode === 'batting' ? 'Runs' : 'Wickets'} across recent matches`} />
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={playerStats.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={playerStats.mode === 'batting' ? '#00E676' : '#8B5CF6'} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={playerStats.mode === 'batting' ? '#00E676' : '#8B5CF6'} stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="match" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey={playerStats.mode === 'batting' ? 'runs' : 'wickets'} fill="url(#colorMain)" radius={[6, 6, 0, 0]} barSize={30} name={playerStats.mode === 'batting' ? 'Runs' : 'Wickets'} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <GlassCard className="h-full p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl hover:border-white/10 transition-colors">
            <ChartHeader title={playerStats.mode === 'batting' ? 'Strike Rate Velocity' : 'Economy Rate'} subtitle={`${playerStats.mode === 'batting' ? 'SR' : 'Econ'} progression`} />
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={playerStats.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="match" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={playerStats.mode === 'batting' ? 'sr' : 'econ'} stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#0A0A0C', stroke: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#3B82F6', stroke: 'white' }} name={playerStats.mode === 'batting' ? 'Strike Rate' : 'Economy'} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}>
          <GlassCard className="h-full p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl hover:border-white/10 transition-colors">
            <ChartHeader title={`${homeTeam} Squad Balance`} subtitle="Predicted XI role distribution" />
            <div className="flex flex-col h-[300px]">
              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={playerStats.roleDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {playerStats.roleDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-space font-black text-white">11</span>
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Players</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {playerStats.roleDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">{item.name}</span>
                    <span className="text-[9px] font-black text-gray-500">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <GlassCard className="h-full p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl hover:border-white/10 transition-colors">
            <ChartHeader title="Win Probability Timeline" subtitle="How the match outcome shifts over overs (Simulated)" />
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={winProbTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="indiaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="oppFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="over" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="india" stroke="#00E676" strokeWidth={2.5} fill="url(#indiaFill)" name={`${homeTeam} Win %`} />
                <Area type="monotone" dataKey="opponent" stroke="#EF4444" strokeWidth={2} fill="url(#oppFill)" name={`${awayTeam} Win %`} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
