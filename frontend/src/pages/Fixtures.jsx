import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock } from 'lucide-react'

const fixtures = [
  { id: 1, match: 'India vs Australia', team1: 'in', team2: 'au', format: 'T20I', series: 'Bilateral Series', venue: 'Wankhede Stadium, Mumbai', date: 'Aug 15, 2026', time: '7:00 PM IST', status: 'upcoming' },
  { id: 2, match: 'England vs India', team1: 'gb-eng', team2: 'in', format: 'Test', series: '5-Match Series', venue: "Lord's, London", date: 'Sep 1, 2026', time: '3:30 PM IST', status: 'upcoming' },
  { id: 3, match: 'Australia vs England', team1: 'au', team2: 'gb-eng', format: 'ODI', series: 'Ashes ODI', venue: 'MCG, Melbourne', date: 'Sep 20, 2026', time: '9:30 AM IST', status: 'upcoming' },
  { id: 4, match: 'India vs South Africa', team1: 'in', team2: 'za', format: 'T20I', series: 'SA Tour of India', venue: 'M. Chinnaswamy, Bangalore', date: 'Oct 5, 2026', time: '7:00 PM IST', status: 'upcoming' },
  { id: 5, match: 'India vs New Zealand', team1: 'in', team2: 'nz', format: 'Test', series: 'Border-Gavaskar', venue: 'Eden Gardens, Kolkata', date: 'Oct 20, 2026', time: '9:30 AM IST', status: 'upcoming' },
  { id: 6, match: 'India vs Pakistan', team1: 'in', team2: 'pk', format: 'ODI', series: 'Champions Trophy', venue: 'Dubai International', date: 'Nov 10, 2026', time: '2:00 PM IST', status: 'upcoming' },
  { id: 7, match: 'India Women vs Australia Women', team1: 'in', team2: 'au', format: 'T20I', series: "Women's Bilateral", venue: 'DY Patil, Mumbai', date: 'Aug 25, 2026', time: '7:00 PM IST', status: 'upcoming' },
  { id: 8, match: 'England Women vs India Women', team1: 'gb-eng', team2: 'in', format: 'ODI', series: "Women's Series", venue: 'The Oval, London', date: 'Sep 15, 2026', time: '3:30 PM IST', status: 'upcoming' },
]

const formatColors = {
  T20I: { bg: 'bg-[#00E676]/10', text: 'text-[#00E676]', border: 'border-[#00E676]/20' },
  ODI: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Test: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
}

const Fixtures = () => {
  return (
    <div className="space-y-8 pb-12 font-inter max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-space font-bold text-white mb-1">Match Fixtures</h1>
        <p className="text-sm text-gray-500">Upcoming international matches — Men's & Women's cricket</p>
      </motion.div>

      {/* Fixture Cards */}
      <div className="space-y-3">
        {fixtures.map((f, i) => {
          const fc = formatColors[f.format] || formatColors.T20I
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative p-5 rounded-2xl bg-[#0A0A0C]/50 border border-white/[0.06] hover:border-white/[0.12] transition-all overflow-hidden"
            >
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E676]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Teams */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <img src={`https://flagcdn.com/w40/${f.team1}.png`} alt="" className="w-9 rounded shadow border border-white/10" />
                    <span className="text-[10px] font-black text-gray-700 italic">VS</span>
                    <img src={`https://flagcdn.com/w40/${f.team2}.png`} alt="" className="w-9 rounded shadow border border-white/10" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{f.match}</h3>
                    <p className="text-[10px] text-gray-600">{f.series}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${fc.bg} ${fc.text} ${fc.border}`}>{f.format}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <MapPin size={11} />
                    <span className="truncate max-w-[160px]">{f.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Calendar size={11} />
                    <span>{f.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Clock size={11} />
                    <span>{f.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Fixtures
