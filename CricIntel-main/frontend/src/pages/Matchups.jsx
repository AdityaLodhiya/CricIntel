import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, TrendingUp, TrendingDown, Trophy, Target, Swords } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useMatchStore } from '../store/matchStore'
import { SQUADS } from './Prediction/PlayingXIReveal'

const getFlag = (team) => ({ India: 'in', Australia: 'au', England: 'gb-eng', 'South Africa': 'za', 'New Zealand': 'nz' })[team] || 'in'

// ─────────────────────────────────────────────
// Team H2H Records
// ─────────────────────────────────────────────
const getTeamH2H = (home, away, format) => {
  const isTest = format === 'Test'
  const isODI = format === 'ODI'
  const played = isTest ? 106 : isODI ? 148 : 32
  // Create deterministic pseudorandom wins based on names
  const seed = home.length + away.length
  const homeWon = Math.floor(played * 0.4) + (seed % 10)
  const awayWon = Math.floor(played * 0.35) + (seed % 7)
  const noResult = played - homeWon - awayWon
  return { played, homeWon, awayWon, noResult }
}

// Matchups are now dynamically generated inside the component based on active squads.
// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
const H2HBar = ({ label, value, total, color, isRight }) => {
  const pct = ((value / total) * 100).toFixed(0)
  return (
    <div className="flex items-center gap-3">
      <span className={`text-[10px] font-bold w-16 ${isRight ? 'text-right' : 'text-left'} text-gray-400 uppercase tracking-wider`}>{label}</span>
      <div className="flex-1 h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-black text-white w-8 text-right">{value}</span>
    </div>
  )
}

const MatchupCard = ({ matchup }) => {
  const [expanded, setExpanded] = useState(false)
  const { batter, bowler, stats } = matchup
  const dominance = stats.avg > 30 ? 'batter' : stats.avg < 18 ? 'bowler' : 'even'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0C]/50 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Batter */}
            <div className="text-right min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{batter.name}</p>
              <p className="text-[10px] text-gray-600">{batter.hand} • {batter.team}</p>
            </div>

            {/* VS */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#00E676]/10 to-blue-500/10 border border-white/[0.06] flex items-center justify-center">
              <Swords size={14} className="text-gray-500" />
            </div>

            {/* Bowler */}
            <div className="text-left min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{bowler.name}</p>
              <p className="text-[10px] text-gray-600">{bowler.style} • {bowler.team}</p>
            </div>
          </div>

          {/* Format + Quick stat */}
          <div className="ml-4 shrink-0 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{matchup.format}</span>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              dominance === 'batter' ? 'bg-[#00E676]/10 text-[#00E676]' :
              dominance === 'bowler' ? 'bg-red-500/10 text-red-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {dominance === 'batter' ? <TrendingUp size={12}/> : dominance === 'bowler' ? <TrendingDown size={12}/> : null}
              {stats.avg.toFixed(1)}
            </div>
            <ArrowRight size={14} className={`text-gray-600 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Dominance bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[8px] text-gray-600 font-bold uppercase w-10">Bat</span>
          <div className="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden flex">
            <div className="h-full rounded-l-full bg-[#00E676]" style={{ width: `${Math.min(stats.avg * 2, 100)}%` }} />
            <div className="h-full rounded-r-full bg-red-500 ml-auto" style={{ width: `${Math.max(100 - stats.avg * 2, 10)}%` }} />
          </div>
          <span className="text-[8px] text-gray-600 font-bold uppercase w-10 text-right">Bowl</span>
        </div>
      </button>

      {/* Expanded Stats */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5">
              <div className="border-t border-white/[0.04] pt-4">
                <div className="grid grid-cols-5 gap-2.5">
                  {[
                    { label: 'Innings', value: stats.innings },
                    { label: 'Runs', value: stats.runs },
                    { label: 'Balls', value: stats.balls },
                    { label: 'SR', value: stats.sr.toFixed(1) },
                    { label: 'Dismissals', value: stats.dismissals },
                    { label: 'Dots', value: stats.dots },
                    { label: '4s', value: stats.fours },
                    { label: '6s', value: stats.sixes },
                    { label: 'Avg', value: stats.avg.toFixed(1) },
                    { label: 'Dot %', value: `${((stats.dots / stats.balls) * 100).toFixed(0)}%` },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                      <p className="text-sm font-bold text-white">{s.value}</p>
                      <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const Matchups = () => {
  const [search, setSearch] = useState('')
  const request = useMatchStore()
  
  const { gender, format, homeTeam, awayTeam } = request
  
  const h2h = getTeamH2H(homeTeam, awayTeam, format)

  // Extract active XIs
  const homeSquad = SQUADS[gender]?.[homeTeam]?.[format]?.xi || []
  const awaySquad = SQUADS[gender]?.[awayTeam]?.[format]?.xi || []
  
  const homeBatters = homeSquad.filter(p => ['Batter', 'WK-Batter', 'All-Rounder'].includes(p.role))
  const homeBowlers = homeSquad.filter(p => ['Bowler (Pace)', 'Bowler (Spin)', 'All-Rounder'].includes(p.role))
  const awayBatters = awaySquad.filter(p => ['Batter', 'WK-Batter', 'All-Rounder'].includes(p.role))
  const awayBowlers = awaySquad.filter(p => ['Bowler (Pace)', 'Bowler (Spin)', 'All-Rounder'].includes(p.role))

  // Helper to generate a realistic mock matchup
  const generateMatchup = (batter, bowler, bTeam, bowlTeam) => {
    const seed = batter.name.length + bowler.name.length
    const innings = (seed % 10) + 3
    const balls = innings * ((seed % 15) + 8)
    const runs = Math.floor(balls * (1 + (seed % 5) * 0.1))
    const dismissals = (seed % 4) + 1
    const avg = runs / dismissals
    const sr = (runs / balls) * 100
    const dots = Math.floor(balls * 0.35)
    const fours = Math.floor(runs * 0.4 / 4)
    const sixes = Math.floor(runs * 0.15 / 6)
    
    return {
      batter: { name: batter.name, hand: batter.batHand || 'RHB', team: bTeam },
      bowler: { name: bowler.name, style: bowler.bowlStyle || 'Right-Arm Fast', team: bowlTeam },
      format: format,
      stats: { innings, runs, balls, avg, sr, dismissals, dots, fours, sixes }
    }
  }

  // Generate 6 matchups based on top active players
  const generatedMatchups = []
  if (homeBatters.length > 0 && awayBowlers.length > 0) {
    generatedMatchups.push(generateMatchup(homeBatters[0], awayBowlers[awayBowlers.length - 1], homeTeam, awayTeam))
    if (homeBatters.length > 1) generatedMatchups.push(generateMatchup(homeBatters[1], awayBowlers[0], homeTeam, awayTeam))
    if (homeBatters.length > 2 && awayBowlers.length > 1) generatedMatchups.push(generateMatchup(homeBatters[2], awayBowlers[1], homeTeam, awayTeam))
  }
  if (awayBatters.length > 0 && homeBowlers.length > 0) {
    generatedMatchups.push(generateMatchup(awayBatters[0], homeBowlers[homeBowlers.length - 1], awayTeam, homeTeam))
    if (awayBatters.length > 1) generatedMatchups.push(generateMatchup(awayBatters[1], homeBowlers[0], awayTeam, homeTeam))
    if (awayBatters.length > 2 && homeBowlers.length > 1) generatedMatchups.push(generateMatchup(awayBatters[2], homeBowlers[1], awayTeam, homeTeam))
  }

  const filtered = generatedMatchups.filter(m => {
    return m.batter.name.toLowerCase().includes(search.toLowerCase()) ||
           m.bowler.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-8 pb-12 font-inter max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-space font-bold text-white mb-1">Matchups & H2H</h1>
        <p className="text-sm text-gray-500">Head-to-head records, batter vs bowler analysis across all formats</p>
      </motion.div>

      {/* Team H2H Section */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard className="p-6 bg-[#0A0A0C]/50 border border-white/5 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <img src={`https://flagcdn.com/w40/${getFlag(request.homeTeam)}.png`} alt={request.homeTeam} className="w-10 rounded shadow border border-white/10" />
              <div>
                <h2 className="text-lg font-bold text-white">{request.homeTeam} vs {request.awayTeam}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Head-to-Head Record</p>
              </div>
              <img src={`https://flagcdn.com/w40/${getFlag(request.awayTeam)}.png`} alt={request.awayTeam} className="w-10 rounded shadow border border-white/10" />
            </div>
              {/* Removed manual format filter as per user request to only show selected format */}
              <div className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                {format} Matchups Only
              </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-2xl font-black text-white">{h2h.played}</p>
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">Played</p>
            </div>
            <div className="p-4 rounded-xl bg-[#00E676]/5 border border-[#00E676]/10 text-center">
              <p className="text-2xl font-black text-[#00E676]">{h2h.homeWon}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">{request.homeTeam} Won</p>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-center">
              <p className="text-2xl font-black text-yellow-400">{h2h.awayWon}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">{request.awayTeam} Won</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-2xl font-black text-gray-400">{h2h.noResult}</p>
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">{h2hFormat === 'Test' ? 'Draws' : 'NR'}</p>
            </div>
          </div>

          {/* Win bars */}
          <div className="space-y-2">
            <H2HBar label={request.homeTeam} value={h2h.homeWon} total={h2h.played} color="#00E676" />
            <H2HBar label={request.awayTeam} value={h2h.awayWon} total={h2h.played} color="#F59E0B" isRight />
          </div>
        </GlassCard>
      </motion.div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 focus:border-[#00E676]/30 transition-all"
          />
        </div>
        {/* Filter Removed */}
      </div>

      {/* Matchup Cards */}
      <div className="space-y-3">
        {filtered.map((m, i) => (
          <MatchupCard key={i} matchup={m} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Target size={32} className="mx-auto mb-3 text-gray-700" />
            <p className="text-sm font-medium">No matchups found for "{search}" in {formatFilter} format</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Matchups
