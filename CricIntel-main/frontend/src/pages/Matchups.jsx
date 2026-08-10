import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Swords, Settings2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Plot from 'react-plotly.js'
import api from '@/services/api'
import GlowButton from '@/components/ui/GlowButton'
import toast from 'react-hot-toast'
import { getFlagUrl } from '@/utils/constants'
import { useMatchStore } from '@/store/matchStore'

// ─── Skeleton components ─────────────────────────────────────────────────────

const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
)

const StatSkeleton = () => (
  <div className="grid grid-cols-4 gap-4 text-center">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="space-y-2">
        <SkeletonCard className="h-8 w-16 mx-auto" />
        <SkeletonCard className="h-3 w-12 mx-auto" />
      </div>
    ))}
  </div>
)

// ─── Team Selector (horizontal scroll) ───────────────────────────────────────

const TeamSelector = ({ label, selectedTeam, teams, disabledTeam, onChange, loading }) => {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 180, behavior: 'smooth' })
    }
  }

  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
      {loading ? (
        <div className="flex gap-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} className="h-12 w-28 flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Left scroll arrow */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 backdrop-blur-sm border border-white/10 rounded-full p-1 hover:bg-white/10 transition-colors"
            style={{ display: teams.length > 4 ? 'flex' : 'none' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-none px-1 py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {teams.map(team => {
              const isSelected = team === selectedTeam
              const isDisabled = team === disabledTeam
              return (
                <button
                  key={team}
                  disabled={isDisabled}
                  onClick={() => onChange(team)}
                  title={team}
                  className={`
                    flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all
                    ${isSelected
                      ? 'border-primary bg-primary/15 text-white shadow-lg shadow-primary/20'
                      : isDisabled
                        ? 'border-white/5 bg-white/3 text-gray-700 cursor-not-allowed opacity-40'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <img
                    src={getFlagUrl(team)}
                    alt={team}
                    className="w-5 h-3.5 rounded object-cover flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <span className="whitespace-nowrap max-w-[80px] truncate">{team}</span>
                </button>
              )
            })}
          </div>

          {/* Right scroll arrow */}
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 backdrop-blur-sm border border-white/10 rounded-full p-1 hover:bg-white/10 transition-colors"
            style={{ display: teams.length > 4 ? 'flex' : 'none' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Matchup Card ─────────────────────────────────────────────────────────────

const MatchupCard = ({ matchup, isSelected, onClick }) => (
  <GlassCard
    onClick={onClick}
    className={`p-4 cursor-pointer transition-all hover:border-white/20 ${
      isSelected ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5'
    }`}
  >
    <div className="flex justify-between items-center gap-2">
      {/* Batter */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <img
          src={getFlagUrl(matchup.batterTeam)}
          alt={matchup.batterTeam}
          className="w-5 h-3.5 rounded object-cover flex-shrink-0"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{matchup.batter}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Batter</p>
        </div>
      </div>

      {/* VS badge */}
      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded flex-shrink-0">VS</span>

      {/* Bowler */}
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-row-reverse">
        <img
          src={getFlagUrl(matchup.bowlerTeam)}
          alt={matchup.bowlerTeam}
          className="w-5 h-3.5 rounded object-cover flex-shrink-0"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="min-w-0 text-right">
          <p className="text-sm font-bold text-white truncate">{matchup.bowler}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Bowler</p>
        </div>
      </div>
    </div>

    {/* Mini stats or no-data message */}
    {matchup.hasHistory && (matchup.runs > 0 || matchup.balls > 0 || matchup.outs > 0) ? (
      <div className="flex justify-between mt-3 pt-3 border-t border-white/5 text-center">
        <div>
          <p className="text-sm font-space font-black text-white">{matchup.runs}</p>
          <p className="text-[9px] text-gray-600 uppercase">Runs</p>
        </div>
        <div>
          <p className="text-sm font-space font-black text-white">{matchup.balls}</p>
          <p className="text-[9px] text-gray-600 uppercase">Balls</p>
        </div>
        <div>
          <p className="text-sm font-space font-black text-primary">{matchup.outs}</p>
          <p className="text-[9px] text-primary uppercase">Wkts</p>
        </div>
        <div>
          <p className="text-sm font-space font-black text-white">{matchup.strikeRate}</p>
          <p className="text-[9px] text-gray-600 uppercase">SR</p>
        </div>
      </div>
    ) : (
      <p className="mt-2 pt-2 border-t border-white/5 text-[10px] text-gray-600 text-center">No direct historical matchup</p>
    )}
  </GlassCard>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const Matchups = () => {
  const location = useLocation()
  const matchStore = useMatchStore()
  const setMatchDetails = matchStore.setMatchDetails

  const [config, setConfig] = useState({
    teamA: location.state?.homeTeam || matchStore.homeTeam || 'India',
    teamB: location.state?.awayTeam || matchStore.awayTeam || 'Australia',
    gender: location.state?.gender || matchStore.gender || 'Men',
    format: location.state?.format || matchStore.format || 'T20',
    venue: location.state?.venue || matchStore.venue || '',
  })

  const [teams, setTeams] = useState([])
  const [teamsLoading, setTeamsLoading] = useState(true)

  const [matchupsList, setMatchupsList] = useState([])
  const [selectedMatchup, setSelectedMatchup] = useState(null)
  const [plotlyData, setPlotlyData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [venueStats, setVenueStats] = useState(null)
  const [venueLoading, setVenueLoading] = useState(false)

  // ── Load teams from backend
  useEffect(() => {
    let active = true
    setTeamsLoading(true)
    api.get('/visualizations/options/', { params: { format: config.format } })
      .then(res => {
        if (active && res.data?.teams?.length > 0) {
          setTeams(res.data.teams)
        }
      })
      .catch(() => {
        // fallback to commonly known teams
        if (active) setTeams(['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'West Indies', 'Afghanistan'])
      })
      .finally(() => { if (active) setTeamsLoading(false) })
    return () => { active = false }
  }, [config.format, config.gender])

  // ── Load venue stats
  useEffect(() => {
    if (!config.venue) return
    let active = true
    setVenueLoading(true)
    api.get('/visualizations/venue-stats/', {
      params: { venue: config.venue, format: config.format, teamA: config.teamA, teamB: config.teamB }
    }).then(res => {
      if (active && res.data?.stats) setVenueStats(res.data.stats)
    }).catch(() => {
      if (active) setVenueStats(null)
    }).finally(() => { if (active) setVenueLoading(false) })
    return () => { active = false }
  }, [config.venue, config.format, config.teamA, config.teamB])

  // ── Initial load
  useEffect(() => {
    handleGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── When selected matchup changes → re-fetch the radar/bar for that specific matchup
  useEffect(() => {
    if (!selectedMatchup) return
    let active = true
    api.get('/visualizations/matchup-radar/', {
      params: {
        teamA: config.teamA,
        teamB: config.teamB,
        format: config.format,
        gender: config.gender,
        batter: selectedMatchup.batter,
        bowler: selectedMatchup.bowler,
      }
    }).then(res => {
      if (active && res.data) setPlotlyData(res.data)
    }).catch(() => {})
    return () => { active = false }
  }, [selectedMatchup])

  const handleGenerate = async () => {
    if (config.teamA === config.teamB) {
      toast.error('Teams must be different')
      return
    }
    setIsGenerating(true)
    setMatchupsList([])
    setSelectedMatchup(null)
    setPlotlyData(null)
    try {
      setMatchDetails({ homeTeam: config.teamA, awayTeam: config.teamB, format: config.format, gender: config.gender, venue: config.venue })
      const res = await api.get('/visualizations/matchup-radar/', {
        params: { teamA: config.teamA, teamB: config.teamB, format: config.format, gender: config.gender }
      })
      if (res.data) {
        setPlotlyData(res.data)
        const list = res.data.matchupsList || []
        setMatchupsList(list)
        if (list.length > 0) setSelectedMatchup(list[0])
        toast.success('Matchups loaded')
      }
    } catch (err) {
      toast.error('Failed to load matchups: ' + (err.response?.data?.error || err.message))
    } finally {
      setIsGenerating(false)
    }
  }

  const currentMeta = selectedMatchup || plotlyData?.metadata || null

  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader
        title="Head-to-Head Matchups"
        description="Real historical player vs player records and statistical dominance from production datasets."
        icon={Swords}
        breadcrumbs={[{ label: 'Matchups' }]}
      />

      {/* ── Config Panel ─────────────────────────────────────────────────── */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 size={20} className="text-primary" />
          <h2 className="text-lg font-space font-black text-white">Matchup Configuration</h2>
        </div>

        <div className="space-y-5">
          {/* Gender + Format toggles */}
          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Gender</label>
              <div className="flex bg-white/5 rounded-xl p-1 relative">
                <div
                  className="absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300"
                  style={{ left: config.gender === 'Men' ? '4px' : 'calc(50% + 2px)' }}
                />
                {['Men', 'Women'].map(g => (
                  <button
                    key={g}
                    onClick={() => setConfig(c => ({ ...c, gender: g }))}
                    className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${config.gender === g ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Format</label>
              <div className="flex bg-white/5 rounded-xl p-1 relative">
                <div
                  className="absolute inset-y-1 w-[calc(33.33%-4px)] bg-primary rounded-lg transition-all duration-300"
                  style={{
                    left: config.format === 'Test' ? '4px'
                      : config.format === 'ODI' ? 'calc(33.33% + 2px)'
                        : 'calc(66.66%)'
                  }}
                />
                {['Test', 'ODI', 'T20'].map(f => (
                  <button
                    key={f}
                    onClick={() => setConfig(c => ({ ...c, format: f }))}
                    className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${config.format === f ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team A selector */}
          <TeamSelector
            label="Team A (Batting)"
            selectedTeam={config.teamA}
            teams={teams}
            disabledTeam={config.teamB}
            onChange={v => setConfig(c => ({ ...c, teamA: v }))}
            loading={teamsLoading}
          />

          {/* Team B selector */}
          <TeamSelector
            label="Team B (Bowling)"
            selectedTeam={config.teamB}
            teams={teams}
            disabledTeam={config.teamA}
            onChange={v => setConfig(c => ({ ...c, teamB: v }))}
            loading={teamsLoading}
          />

          <GlowButton onClick={handleGenerate} isLoading={isGenerating} className="w-full">
            {isGenerating ? 'Loading Matchups...' : 'Load Matchups'}
          </GlowButton>
        </div>
      </GlassCard>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {isGenerating ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left skeleton */}
          <div className="space-y-3">
            <SkeletonCard className="h-5 w-32 mb-4" />
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-20" />)}
          </div>
          {/* Right skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-56" />
            <SkeletonCard className="h-64" />
          </div>
        </div>
      ) : matchupsList.length === 0 && plotlyData ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Swords size={40} className="text-gray-600 mx-auto opacity-40" />
          <p className="text-gray-400 font-bold">No historical matchup data available</p>
          <p className="text-gray-600 text-sm">{config.teamA} vs {config.teamB} ({config.format}) has no recorded encounters in the dataset.</p>
        </GlassCard>
      ) : matchupsList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Matchup cards + Venue Context ───────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Swords size={16} className="text-primary" />
              Key Face-offs ({matchupsList.length})
            </h3>

            <div className="space-y-3">
              {matchupsList.map(m => (
                <MatchupCard
                  key={m.id}
                  matchup={m}
                  isSelected={selectedMatchup?.id === m.id}
                  onClick={() => setSelectedMatchup(m)}
                />
              ))}
            </div>

            {/* Venue Context */}
            {config.venue && (
              <GlassCard variant="blue" className="p-5 mt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400" />
                  Venue Context
                </h4>
                {venueLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-4" />)}
                  </div>
                ) : venueStats ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Venue</span>
                      <span className="text-white font-bold text-right max-w-[60%] truncate">{config.venue.split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg 1st Inn</span>
                      <span className="text-white font-bold">{venueStats.avg1stInn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg 2nd Inn</span>
                      <span className="text-white font-bold">{venueStats.avg2ndInn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pace / Spin</span>
                      <span className="text-white font-bold">{venueStats.paceWickets} / {venueStats.spinWickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Batting First</span>
                      <span className="text-white font-bold">{venueStats.winBatFirst}</span>
                    </div>
                    {venueStats.matchesPlayedTeams >= 0 && (
                      <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                        <span className="text-gray-400">H2H at Venue</span>
                        <span className="text-white font-bold">
                          {venueStats.matchesPlayedTeams === 0 ? 'No meetings' : `${venueStats.matchesPlayedTeams} match${venueStats.matchesPlayedTeams !== 1 ? 'es' : ''}`}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No venue data available.</p>
                )}
              </GlassCard>
            )}

            {/* Match context summary */}
            <GlassCard className="p-4 border-white/5">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Matchup</span>
                  <span className="text-white font-bold">{config.teamA} vs {config.teamB}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Format</span>
                  <span className="text-white font-bold">{config.format} ({config.gender})</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ── Right: Detail Panel ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Historical Record */}
            {currentMeta && (
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 text-center">
                  Historical Record at {config.venue ? config.venue.split(',')[0] : 'International'} & Beyond
                </h3>

                {/* Player portraits */}
                <div className="flex justify-between items-center mb-8">
                  <div className="text-center w-1/3">
                    <div className="w-20 h-20 mx-auto rounded-full border border-white/10 bg-black/50 flex items-center justify-center mb-3 overflow-hidden shadow-lg">
                      <img
                        src={getFlagUrl(currentMeta.batterTeam)}
                        alt={currentMeta.batterTeam}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <h4 className="text-lg font-bold text-white">{currentMeta.batter}</h4>
                    <p className="text-xs text-gray-500 uppercase">Key Batter</p>
                  </div>

                  <div className="w-1/3 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-2">
                      <Swords size={20} className="text-primary opacity-70" />
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">vs</p>
                  </div>

                  <div className="text-center w-1/3">
                    <div className="w-20 h-20 mx-auto rounded-full border border-white/10 bg-black/50 flex items-center justify-center mb-3 overflow-hidden shadow-lg">
                      <img
                        src={getFlagUrl(currentMeta.bowlerTeam)}
                        alt={currentMeta.bowlerTeam}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <h4 className="text-lg font-bold text-white">{currentMeta.bowler}</h4>
                    <p className="text-xs text-gray-500 uppercase">Strike Bowler</p>
                  </div>
                </div>

                {/* Stats */}
                {currentMeta.hasHistory ? (
                  <div className="grid grid-cols-4 gap-4 text-center border-t border-white/10 pt-6">
                    <div>
                      <p className="text-2xl font-space font-black text-white">{currentMeta.runs}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Runs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-space font-black text-white">{currentMeta.balls}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balls</p>
                    </div>
                    <div>
                      <p className="text-2xl font-space font-black text-primary">{currentMeta.outs}</p>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Dismissals</p>
                    </div>
                    <div>
                      <p className="text-2xl font-space font-black text-white">{currentMeta.strikeRate}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strike Rate</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-white/10 pt-6 text-center">
                    <p className="text-gray-500 text-sm font-bold">No historical matchup available</p>
                    <p className="text-gray-600 text-xs mt-1">These two players have no recorded encounters in the dataset.</p>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Performance Splits / Run Distribution */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Performance Splits</h3>
              <div className="h-[240px] w-full flex items-center justify-center">
                {plotlyData?.barPlot ? (
                  <Plot
                    data={plotlyData.barPlot.data}
                    layout={{ ...plotlyData.barPlot.layout, autosize: true, margin: { l: 120, r: 20, t: 20, b: 20 } }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">No performance data available</p>
                )}
              </div>
            </GlassCard>

            {/* Match Dominance Radar */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Match Dominance — {config.teamA} vs {config.teamB}
              </h3>
              <div className="h-[280px] w-full flex items-center justify-center">
                {plotlyData?.radarPlot ? (
                  <Plot
                    data={plotlyData.radarPlot.data}
                    layout={{ ...plotlyData.radarPlot.layout, autosize: true, margin: { l: 40, r: 40, t: 40, b: 40 } }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">No dominance data available</p>
                )}
              </div>
            </GlassCard>

          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Matchups
