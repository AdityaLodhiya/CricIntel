import React, { useState, useEffect } from 'react'
import { MapPin, Target, TrendingUp, Droplets, Wind, RotateCcw } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'

// ─── Top 20 venue names in preferred display order ───────────────────────────
// ONLY the names are hardcoded; ALL statistics come from the backend.
const TOP_VENUES = [
  'Wankhede Stadium, Mumbai',
  'Eden Gardens, Kolkata',
  'M Chinnaswamy Stadium, Bengaluru',
  'Narendra Modi Stadium, Ahmedabad',
  'Arun Jaitley Stadium, Delhi',
  'MA Chidambaram Stadium, Chennai',
  'Rajiv Gandhi International Stadium, Hyderabad',
  'PCA Stadium, Centurion',
  'MCG, Melbourne',
  'SCG, Sydney',
  'Adelaide Oval',
  "Lord's Cricket Ground, London",
  "The Oval, London",
  'Headingley, Leeds',
  'Old Trafford, Manchester',
  'Newlands, Cape Town',
  'Wanderers Stadium, Johannesburg',
  'National Stadium, Karachi',
  'Gaddafi Stadium, Lahore',
  'R Premadasa International Cricket Stadium, Colombo',
]

// ─── Skeleton components ──────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
)

const StatCardSkeleton = () => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-9 w-16" />
  </div>
)

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colorClass = 'text-white', iconColor = 'text-gray-400' }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
    <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
      <Icon size={14} />
      <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
    </div>
    <p className={`text-3xl font-space font-black ${colorClass}`}>{value}</p>
  </div>
)

// ─── Main Venues Component ────────────────────────────────────────────────────
const Venues = () => {
  const [selectedVenueName, setSelectedVenueName] = useState(TOP_VENUES[0])
  const [selectedFormat, setSelectedFormat] = useState('T20')

  const [liveStats, setLiveStats]   = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)

  // Fetch venue stats whenever venue or format changes
  useEffect(() => {
    let active = true
    setStatsLoading(true)
    setStatsError(false)
    setLiveStats(null)

    api.get('/visualizations/venue-stats/', {
      params: { venue: selectedVenueName, format: selectedFormat }
    }).then(res => {
      if (active && res.data?.stats) {
        setLiveStats(res.data.stats)
      } else if (active) {
        setStatsError(true)
      }
    }).catch(() => {
      if (active) setStatsError(true)
    }).finally(() => {
      if (active) setStatsLoading(false)
    })

    return () => { active = false }
  }, [selectedVenueName, selectedFormat])

  // ── Derived values from live backend stats ──────────────────────────────────
  const paceVal   = liveStats ? parseInt(liveStats.paceWickets) : 0
  const spinVal   = liveStats ? parseInt(liveStats.spinWickets) : 0
  const winBat    = liveStats ? parseInt(liveStats.winBatFirst) : null
  const winBowl   = liveStats ? parseInt(liveStats.winBowlFirst) : null

  const paceSpinData = paceVal > 0 || spinVal > 0
    ? [{ name: 'Pace', value: paceVal }, { name: 'Spin', value: spinVal }]
    : []

  const COLORS = ['#3B82F6', '#8B5CF6']

  // Toss recommendation derived purely from backend win % data
  const tossRecommendation = winBat !== null
    ? (winBat >= 50 ? 'Bat First' : 'Bowl First')
    : null

  const tossReason = winBat !== null
    ? (winBat >= 50
      ? `Teams batting first win ${winBat}% of ${selectedFormat} matches here.`
      : `Teams bowling first win ${winBowl}% of ${selectedFormat} matches here — chasing favoured.`)
    : null

  // Venue display name (first segment before comma)
  const displayName = selectedVenueName.includes(',')
    ? selectedVenueName.split(',')[0].trim()
    : selectedVenueName

  const displayCity = selectedVenueName.includes(',')
    ? selectedVenueName.slice(selectedVenueName.indexOf(',') + 1).trim()
    : ''

  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader
        title="Venue Intelligence"
        description="Real pitch conditions, historical par scores, and toss analysis from the production dataset."
        icon={MapPin}
        breadcrumbs={[{ label: 'Venues' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Venue Selector List ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">
            Top 20 Venues
          </h3>
          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {TOP_VENUES.map(venueName => {
              const isSelected = venueName === selectedVenueName
              const shortName  = venueName.includes(',')
                ? venueName.split(',')[0].trim()
                : venueName
              const city = venueName.includes(',')
                ? venueName.slice(venueName.indexOf(',') + 1).trim()
                : ''
              return (
                <button
                  key={venueName}
                  onClick={() => setSelectedVenueName(venueName)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 group
                    ${isSelected
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/5'
                    }
                  `}
                >
                  <MapPin
                    size={16}
                    className={`flex-shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-gray-600 group-hover:text-gray-300'}`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {shortName}
                    </p>
                    {city && (
                      <p className="text-[10px] text-gray-600 font-medium truncate">{city}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Venue Analysis Panel ────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Header Card */}
          <GlassCard className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-wrap justify-between items-start mb-8 relative z-10 gap-4">
              <div>
                <h2 className="text-3xl font-space font-black text-white leading-tight">{displayName}</h2>
                {displayCity && (
                  <p className="text-gray-400 font-medium mt-2 flex items-center gap-2 text-sm">
                    <MapPin size={13} className="flex-shrink-0" />
                    {displayCity}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                {/* Format toggle */}
                <div className="flex bg-black/50 border border-white/10 rounded-xl p-1">
                  {['T20', 'ODI', 'Test'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        selectedFormat === f
                          ? 'bg-primary text-black shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="bg-black/50 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs text-primary font-bold">Live Data</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {statsLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : statsError ? (
                <div className="col-span-4 text-center py-6">
                  <p className="text-gray-500 text-sm">No venue statistics in the dataset for <span className="text-white font-bold">{displayName}</span> ({selectedFormat}).</p>
                </div>
              ) : (
                <>
                  <StatCard
                    icon={Target}
                    label="Avg 1st Inn"
                    value={liveStats.avg1stInn}
                    iconColor="text-gray-400"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Avg 2nd Inn"
                    value={liveStats.avg2ndInn}
                    iconColor="text-gray-400"
                  />
                  <StatCard
                    icon={Droplets}
                    label="Win Bat 1st"
                    value={liveStats.winBatFirst}
                    colorClass="text-blue-400"
                    iconColor="text-blue-400"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Win Bowl 1st"
                    value={liveStats.winBowlFirst}
                    colorClass="text-violet-400"
                    iconColor="text-violet-400"
                  />
                </>
              )}
            </div>
          </GlassCard>

          {/* ── Charts Row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Pace vs Spin */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-center">
                Pace vs Spin Dependency
              </h3>

              {statsLoading ? (
                <div className="h-[200px] flex flex-col items-center justify-center gap-4">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <div className="flex gap-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ) : !liveStats || (paceVal === 0 && spinVal === 0) ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm text-center">Bowling style data not available for this venue / format.</p>
                </div>
              ) : (
                <>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paceSpinData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {paceSpinData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(10,11,16,0.95)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '13px',
                          }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(val) => [`${val}%`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-8 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs text-gray-400 font-bold uppercase">Pace ({liveStats.paceWickets})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-xs text-gray-400 font-bold uppercase">Spin ({liveStats.spinWickets})</span>
                    </div>
                  </div>
                </>
              )}
            </GlassCard>

            {/* Toss Recommendation */}
            <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">
                Toss Recommendation
              </h3>

              {statsLoading ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : tossRecommendation === null ? (
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <RotateCcw size={28} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">Insufficient historical data to determine toss recommendation.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center shadow-lg
                    ${tossRecommendation === 'Bat First'
                      ? 'bg-blue-500/10 border-blue-500 shadow-blue-500/20'
                      : 'bg-violet-500/10 border-violet-500 shadow-violet-500/20'
                    }`}
                  >
                    <Target size={32} className={tossRecommendation === 'Bat First' ? 'text-blue-400' : 'text-violet-400'} />
                  </div>
                  <div>
                    <p className={`text-2xl font-space font-black ${tossRecommendation === 'Bat First' ? 'text-blue-400' : 'text-violet-400'}`}>
                      {tossRecommendation}
                    </p>
                    <p className="text-sm text-gray-400 mt-2 max-w-[220px] mx-auto leading-relaxed">{tossReason}</p>
                  </div>

                  {/* Win % bar */}
                  <div className="w-full mt-2 space-y-2">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold px-1">
                      <span>Bat First {liveStats.winBatFirst}</span>
                      <span>Bowl First {liveStats.winBowlFirst}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                        style={{ width: liveStats.winBatFirst }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* ── Additional venue info strip ──────────────────────────── */}
          {!statsLoading && liveStats && liveStats.matchesPlayedTeams !== undefined && (
            <GlassCard className="px-6 py-4 border-white/5">
              <div className="flex flex-wrap gap-6 text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <Wind size={13} className="text-primary" />
                  <span className="font-bold uppercase tracking-widest">Format:</span>
                  <span className="text-white font-bold">{selectedFormat}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={13} className="text-primary" />
                  <span className="font-bold uppercase tracking-widest">Venue:</span>
                  <span className="text-white font-bold">{displayName}</span>
                </div>
                <div className="ml-auto text-gray-600 italic">
                  All statistics derived from production-grade historical match datasets.
                </div>
              </div>
            </GlassCard>
          )}

        </div>
      </div>
    </div>
  )
}

export default Venues
