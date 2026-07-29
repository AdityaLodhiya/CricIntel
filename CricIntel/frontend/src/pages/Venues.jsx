import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Cloud, Thermometer, Wind, Droplets, TrendingUp, Sun, ChevronRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

const venues = [
  {
    id: 1,
    name: "Wankhede Stadium",
    city: "Mumbai",
    country: "India",
    capacity: "33,000",
    weather: { temp: "32°C", humidity: "78%", wind: "12 km/h", condition: "Partly Cloudy", dew: "High" },
    stats: {
      T20: {
        matchesPlayed: 82, avgFirstInnings: 168, avgSecondInnings: 152, tossWinBat: 58, tossWinBowl: 42,
        highestScore: "235/4", lowestScore: "92", avgPaceWickets: 4.2, avgSpinWickets: 5.8
      },
      ODI: {
        matchesPlayed: 32, avgFirstInnings: 298, avgSecondInnings: 260, tossWinBat: 55, tossWinBowl: 45,
        highestScore: "438/4", lowestScore: "115", avgPaceWickets: 5.2, avgSpinWickets: 4.8
      },
      Test: {
        matchesPlayed: 26, avgFirstInnings: 330, avgSecondInnings: 310, tossWinBat: 65, tossWinBowl: 35,
        highestScore: "631/10", lowestScore: "93", avgPaceWickets: 3.5, avgSpinWickets: 6.5
      }
    },
    pitchType: "Spin-Friendly",
    suggestion: "Consider playing an extra spinner. Dew factor in 2nd innings aids chasing. Wrist spinners historically dominate here."
  },
  {
    id: 2,
    name: "Melbourne Cricket Ground",
    city: "Melbourne",
    country: "Australia",
    capacity: "100,024",
    weather: { temp: "22°C", humidity: "45%", wind: "18 km/h", condition: "Sunny", dew: "Low" },
    stats: {
      T20: {
        matchesPlayed: 18, avgFirstInnings: 158, avgSecondInnings: 145, tossWinBat: 45, tossWinBowl: 55,
        highestScore: "186/5", lowestScore: "74", avgPaceWickets: 6.4, avgSpinWickets: 3.6
      },
      ODI: {
        matchesPlayed: 151, avgFirstInnings: 275, avgSecondInnings: 240, tossWinBat: 52, tossWinBowl: 48,
        highestScore: "344/8", lowestScore: "94", avgPaceWickets: 6.0, avgSpinWickets: 4.0
      },
      Test: {
        matchesPlayed: 115, avgFirstInnings: 350, avgSecondInnings: 320, tossWinBat: 55, tossWinBowl: 45,
        highestScore: "624/8", lowestScore: "104", avgPaceWickets: 6.2, avgSpinWickets: 3.8
      }
    },
    pitchType: "Pace-Friendly",
    suggestion: "Load up on pace bowlers. The bounce and carry favor fast bowlers. Left-arm pacers have a strong record here."
  },
  {
    id: 3,
    name: "MA Chidambaram Stadium",
    city: "Chennai",
    country: "India",
    capacity: "50,000",
    weather: { temp: "35°C", humidity: "82%", wind: "8 km/h", condition: "Hot & Humid", dew: "Very High" },
    stats: {
      T20: {
        matchesPlayed: 74, avgFirstInnings: 162, avgSecondInnings: 148, tossWinBat: 45, tossWinBowl: 55,
        highestScore: "218/4", lowestScore: "88", avgPaceWickets: 3.5, avgSpinWickets: 6.5
      },
      ODI: {
        matchesPlayed: 35, avgFirstInnings: 260, avgSecondInnings: 235, tossWinBat: 60, tossWinBowl: 40,
        highestScore: "337/7", lowestScore: "112", avgPaceWickets: 4.2, avgSpinWickets: 5.8
      },
      Test: {
        matchesPlayed: 35, avgFirstInnings: 340, avgSecondInnings: 310, tossWinBat: 65, tossWinBowl: 35,
        highestScore: "759/7", lowestScore: "83", avgPaceWickets: 3.8, avgSpinWickets: 6.2
      }
    },
    pitchType: "Spin Paradise",
    suggestion: "Play 2 spinners minimum. Hot dry conditions cause the pitch to deteriorate. Bat first to maximize advantage. Slow left-arm orthodox is devastating here."
  },
  {
    id: 4,
    name: "Lord's Cricket Ground",
    city: "London",
    country: "England",
    capacity: "31,100",
    weather: { temp: "18°C", humidity: "65%", wind: "22 km/h", condition: "Overcast", dew: "Low" },
    stats: {
      T20: {
        matchesPlayed: 12, avgFirstInnings: 165, avgSecondInnings: 155, tossWinBat: 50, tossWinBowl: 50,
        highestScore: "199/4", lowestScore: "93", avgPaceWickets: 5.5, avgSpinWickets: 4.5
      },
      ODI: {
        matchesPlayed: 68, avgFirstInnings: 260, avgSecondInnings: 230, tossWinBat: 58, tossWinBowl: 42,
        highestScore: "334/4", lowestScore: "107", avgPaceWickets: 5.8, avgSpinWickets: 4.2
      },
      Test: {
        matchesPlayed: 144, avgFirstInnings: 310, avgSecondInnings: 290, tossWinBat: 52, tossWinBowl: 48,
        highestScore: "729/6", lowestScore: "38", avgPaceWickets: 6.5, avgSpinWickets: 3.5
      }
    },
    pitchType: "Pace-Friendly",
    suggestion: "Slope favors seam and swing bowlers, especially when overcast. Fast-medium bowlers are highly effective."
  }
]

const VenueCard = ({ venue, onClick, isSelected }) => (
  <motion.button
    whileHover={{ y: -2 }}
    onClick={() => onClick(venue)}
    className={`w-full p-4 rounded-xl text-left transition-all ${
      isSelected 
        ? 'bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
        : 'bg-[#0A0A0C]/50 border border-white/[0.06] hover:border-white/[0.15]'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.04] text-gray-500'}`}>
        <MapPin size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white truncate">{venue.name}</p>
        <p className="text-xs text-gray-500">{venue.city}, {venue.country}</p>
      </div>
      <ChevronRight size={16} className={isSelected ? 'text-blue-500' : 'text-gray-700'} />
    </div>
  </motion.button>
)

const VenuesPage = () => {
  const [selected, setSelected] = useState(venues[0])
  const [format, setFormat] = useState('T20')

  const currentStats = selected.stats[format]

  return (
    <div className="space-y-6 pb-12 font-inter max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold text-white mb-1">Venue Intelligence</h1>
          <p className="text-sm text-gray-500">Pitch analysis, format-specific stats, and AI suggestions</p>
        </div>
        <div className="flex gap-2 bg-[#0A0A0C]/50 p-1.5 rounded-xl border border-white/5">
          {['T20', 'ODI', 'Test'].map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                format === f
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >{f}</button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Venue List */}
        <div className="space-y-3">
          {venues.map(v => (
            <VenueCard key={v.id} venue={v} onClick={setSelected} isSelected={selected.id === v.id} />
          ))}
        </div>

        {/* Venue Details */}
        <div className="space-y-5">
          {/* Weather */}
          <motion.div key={selected.id + '-weather'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="bg-[#0A0A0C]/50 border-white/[0.06] p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-space font-bold text-white mb-1">{selected.name}</h2>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{selected.city}, {selected.country} • Capacity: {selected.capacity}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                  selected.pitchType.includes('Spin') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  selected.pitchType.includes('Pace') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/20'
                }`}>
                  {selected.pitchType}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/10 transition-colors">
                  <Thermometer size={18} className="text-orange-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{selected.weather.temp}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">Temp</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/10 transition-colors">
                  <Droplets size={18} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{selected.weather.humidity}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">Humidity</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/10 transition-colors">
                  <Wind size={18} className="text-cyan-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{selected.weather.wind}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">Wind</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/10 transition-colors">
                  <Cloud size={18} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{selected.weather.condition}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">Condition</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/10 transition-colors">
                  <Sun size={18} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{selected.weather.dew}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1">Dew Factor</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Match Stats */}
          <motion.div key={`${selected.id}-${format}-stats`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="bg-[#0A0A0C]/50 border-white/[0.06] p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">{format}</div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Stats</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Matches', value: currentStats.matchesPlayed, color: 'text-white' },
                  { label: format === 'Test' ? 'Avg 1st Inn' : 'Avg 1st Bat', value: currentStats.avgFirstInnings, color: 'text-white' },
                  { label: format === 'Test' ? 'Avg 2nd Inn' : 'Avg 2nd Bat', value: currentStats.avgSecondInnings, color: 'text-white' },
                  { label: 'Toss Bat Win', value: `${currentStats.tossWinBat}%`, color: 'text-[#00E676]' },
                  { label: 'Highest Score', value: currentStats.highestScore, color: 'text-white' },
                  { label: 'Lowest Score', value: currentStats.lowestScore, color: 'text-white' },
                  { label: 'Pace Wkts/Match', value: currentStats.avgPaceWickets, color: 'text-red-400' },
                  { label: 'Spin Wkts/Match', value: currentStats.avgSpinWickets, color: 'text-purple-400' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.04] transition-colors">
                    <p className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Pace vs Spin bar */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Pace vs Spin Distribution ({format})</p>
                <div className="h-4 rounded-full overflow-hidden flex bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStats.avgPaceWickets / (currentStats.avgPaceWickets + currentStats.avgSpinWickets)) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full" 
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStats.avgSpinWickets / (currentStats.avgPaceWickets + currentStats.avgSpinWickets)) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full" 
                  />
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Pace ({((currentStats.avgPaceWickets / (currentStats.avgPaceWickets + currentStats.avgSpinWickets)) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Spin ({((currentStats.avgSpinWickets / (currentStats.avgPaceWickets + currentStats.avgSpinWickets)) * 100).toFixed(0)}%)</span>
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Suggestion */}
          <motion.div key={selected.id + '-suggestion'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <TrendingUp size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1.5">AI Team Composition Suggestion</p>
                  <p className="text-sm text-blue-100/80 leading-relaxed">{selected.suggestion}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default VenuesPage
