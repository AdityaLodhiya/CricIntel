import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, BarChart3, Calendar, Users, MapPin, Swords, TrendingUp, Activity, Globe, Trophy, X, ChevronRight } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import toast from 'react-hot-toast'

const quickStats = [
  { label: 'Prediction Accuracy', value: '87%', icon: Activity, color: '#00E676' },
  { label: 'Players Analyzed', value: '2,400+', icon: Users, color: '#3B82F6' },
  { label: 'Venues Covered', value: '12', icon: MapPin, color: '#8B5CF6' },
  { label: 'Matches Processed', value: '5,800+', icon: Trophy, color: '#F59E0B' },
]

const modules = [
  { title: 'Predict XI', subtitle: 'AI-powered Playing XI generation', icon: Zap, linkTo: '/app/prediction', color: '#00E676', glow: 'rgba(0,230,118,0.15)' },
  { title: 'Analytics', subtitle: 'SHAP values, charts & model insights', icon: BarChart3, linkTo: '/app/analytics', color: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
  { title: 'Matchups', subtitle: 'Head-to-head batter vs bowler', icon: Swords, linkTo: '/app/matchups', color: '#8B5CF6', glow: 'rgba(139,92,246,0.15)' },
  { title: 'Fixtures', subtitle: 'Upcoming international matches', icon: Calendar, linkTo: '/app/fixtures', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
  { title: 'Venues', subtitle: 'Pitch, weather & conditions intel', icon: MapPin, linkTo: '/app/venues', color: '#EF4444', glow: 'rgba(239,68,68,0.15)' },
]

const recentPredictions = [
  { match: 'IND vs AUS', format: 'T20', result: 'India favored (73%)', date: 'Jul 12' },
  { match: 'ENG vs IND', format: 'Test', result: 'England favored (58%)', date: 'Jul 10' },
  { match: 'AUS vs ENG', format: 'ODI', result: 'Australia favored (65%)', date: 'Jul 8' },
]

const MatchConfigModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const setMatchDetails = useMatchStore((state) => state.setMatchDetails)
  
  const [config, setConfig] = useState({
    format: 'T20',
    gender: 'Men',
    homeTeam: 'India',
    awayTeam: 'Australia',
    venue: 'Wankhede Stadium, Mumbai'
  })

  const teams = ['India', 'Australia', 'England', 'South Africa', 'New Zealand']
  const venues = [
    'Wankhede Stadium, Mumbai',
    'MCG, Melbourne',
    "Lord's, London",
    'M. Chinnaswamy, Bangalore'
  ]

  const handleHomeTeamChange = (e) => {
    const newHome = e.target.value
    if (newHome === config.awayTeam) {
      const newAway = teams.find(t => t !== newHome)
      setConfig({...config, homeTeam: newHome, awayTeam: newAway})
      toast.error(`Away team changed to ${newAway} to prevent same team selection.`, {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      })
    } else {
      setConfig({...config, homeTeam: newHome})
    }
  }

  const handleAwayTeamChange = (e) => {
    const newAway = e.target.value
    if (newAway === config.homeTeam) {
      const newHome = teams.find(t => t !== newAway)
      setConfig({...config, homeTeam: newHome, awayTeam: newAway})
      toast.error(`Home team changed to ${newHome} to prevent same team selection.`, {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      })
    } else {
      setConfig({...config, awayTeam: newAway})
    }
  }

  const handlePredict = () => {
    if (config.homeTeam === config.awayTeam) {
      toast.error('Home Team and Away Team cannot be the same.', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      })
      return
    }
    setMatchDetails(config)
    onClose()
    navigate('/app/prediction')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#0F1420] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden font-inter"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E676]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0A0A0C]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 flex items-center justify-center border border-[#00E676]/20">
              <Zap size={20} className="text-[#00E676]" />
            </div>
            <div>
              <h2 className="text-xl font-space font-black text-white">Configure Match</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Match Context</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Format</label>
              <div className="flex bg-[#0A0A0C] border border-white/10 rounded-xl p-1">
                {['T20', 'ODI', 'Test'].map(f => (
                  <button
                    key={f}
                    onClick={() => setConfig({...config, format: f})}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${config.format === f ? 'bg-[#00E676] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Gender</label>
              <div className="flex bg-[#0A0A0C] border border-white/10 rounded-xl p-1">
                {['Men', 'Women'].map(g => (
                  <button
                    key={g}
                    onClick={() => setConfig({...config, gender: g})}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${config.gender === g ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Teams */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Teams</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <select 
                  value={config.homeTeam} 
                  onChange={handleHomeTeamChange}
                  className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-[#00E676]/50 transition-colors"
                >
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Home Team</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-black text-xs shrink-0">VS</div>
              <div className="flex-1">
                <select 
                  value={config.awayTeam} 
                  onChange={handleAwayTeamChange}
                  className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-colors"
                >
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Away Team</p>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Venue</label>
            <select 
              value={config.venue} 
              onChange={(e) => setConfig({...config, venue: e.target.value})}
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-purple-500/50 transition-colors"
            >
              {venues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#0A0A0C]/50 flex justify-end">
          <button 
            onClick={handlePredict}
            className="flex items-center gap-2 px-6 py-3 bg-[#00E676] hover:bg-[#00C853] text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]"
          >
            <Zap size={18} />
            Generate Prediction
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const Dashboard = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="space-y-8 pb-12 font-inter max-w-7xl mx-auto">
      
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0A0C] via-[#0F1420] to-[#0A0A0C] border border-white/[0.06] p-8 md:p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00E676]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-black" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E676]">CricIntel Dashboard</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-space font-black text-white mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-[#3B82F6]">CricIntel</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
            Your AI-powered cricket intelligence platform. Predict optimal Playing XIs, analyze player matchups, decode venue conditions, and gain a strategic edge using machine learning.
          </p>
          
          <div className="mt-6">
            <motion.button 
              onClick={() => setIsConfigOpen(true)}
              whileHover={{ scale: 1.03 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00E676] to-[#3B82F6] rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-[#0A0A0C] text-white font-bold px-8 py-3 rounded-xl border border-white/10 flex items-center gap-2 text-sm">
                <Zap size={16} className="text-[#00E676]" />
                Start Predicting
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl bg-[#0A0A0C]/50 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} style={{ color: stat.color }} />
              <TrendingUp size={14} className="text-gray-700" />
            </div>
            <p className="text-2xl font-space font-black text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((mod, i) => (
            <div key={i} onClick={() => {
              if (mod.linkTo === '/app/prediction' || mod.linkTo === '/app/matchups' || mod.linkTo === '/app/analytics') {
                // For modules that rely on match context, open config first if we want, or just navigate
                // Let's just navigate. If they go to prediction without config, it uses the default state in matchStore.
                navigate(mod.linkTo)
              } else {
                navigate(mod.linkTo)
              }
            }}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative group p-5 rounded-2xl bg-[#0A0A0C]/50 border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ backgroundColor: mod.glow }} />
                
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/5" style={{ backgroundColor: `${mod.color}15` }}>
                  <mod.icon size={20} style={{ color: mod.color }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{mod.title}</h3>
                <p className="text-[10px] text-gray-600 leading-relaxed">{mod.subtitle}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Predictions */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Predictions</h2>
        <div className="space-y-2">
          {recentPredictions.map((pred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center justify-between p-4 rounded-xl bg-[#0A0A0C]/30 border border-white/[0.04] hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 flex items-center justify-center">
                  <Activity size={14} className="text-[#00E676]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{pred.match}</p>
                  <p className="text-[10px] text-gray-600">{pred.result}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{pred.format}</span>
                <span className="text-[10px] text-gray-600">{pred.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isConfigOpen && (
          <MatchConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
