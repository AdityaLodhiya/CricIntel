import React, { useState, useEffect } from 'react'
import { Calendar, Zap, MapPin, Trophy, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import EmptyState from '@/components/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/store/matchStore'
import api from '@/services/api'
import { getFlagUrl } from '@/utils/constants'

const SkeletonCard = () => (
  <GlassCard className="p-6 relative overflow-hidden">
    <div className="flex justify-between items-center mb-6">
      <div className="h-5 w-24 bg-white/10 rounded-full animate-pulse"></div>
      <div className="h-4 w-20 bg-white/5 rounded animate-pulse"></div>
    </div>
    <div className="flex items-center justify-between my-4 px-2">
      <div className="flex flex-col items-center flex-1 space-y-2">
        <div className="w-10 h-6 bg-white/10 rounded animate-pulse"></div>
        <div className="h-6 w-24 bg-white/10 rounded animate-pulse"></div>
      </div>
      <div className="px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">VS</div>
      <div className="flex flex-col items-center flex-1 space-y-2">
        <div className="w-10 h-6 bg-white/10 rounded animate-pulse"></div>
        <div className="h-6 w-24 bg-white/10 rounded animate-pulse"></div>
      </div>
    </div>
    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
      <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
      <div className="h-8 w-24 bg-white/10 rounded-xl animate-pulse"></div>
    </div>
  </GlassCard>
)

const Fixtures = () => {
  const navigate = useNavigate()
  const setMatchDetails = useMatchStore(state => state.setMatchDetails)
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/matches/upcoming/').then(res => {
      if (active && res.data?.results) {
        setFixtures(res.data.results)
      }
    }).catch(() => {
      // Fallback handling
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const handlePredictFixture = (fixture) => {
    setMatchDetails({
      homeTeam: fixture.home_team,
      awayTeam: fixture.away_team,
      venue: fixture.venue,
      format: fixture.format,
      gender: 'Men',
    })
    navigate('/app/prediction')
  }

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA'
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    })
  }

  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader 
        title="Global Fixtures"
        description="Upcoming T20, ODI, and Test matches across the globe available for AI Playing XI analysis."
        icon={Calendar}
        breadcrumbs={[
          { label: 'Fixtures' }
        ]}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : fixtures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixtures.map(match => (
            <GlassCard key={match.id} className="p-6 relative overflow-hidden group hover:border-primary/40 transition-all shadow-lg hover:shadow-primary/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {match.format === 'T20' ? 'T20' : match.format} Match
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <Calendar size={13} /> {formatDate(match.date)}
                </span>
              </div>
              
              {match.tournament && (
                <div className="text-center mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate flex justify-center items-center gap-1">
                    <Trophy size={11} className="text-yellow-500/70" /> {match.tournament}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between my-2 px-1">
                <div className="text-center flex-1 flex flex-col items-center">
                  <img src={getFlagUrl(match.home_team)} alt={match.home_team} className="w-8 h-5.5 rounded object-cover mb-2 shadow-sm" onError={(e) => { e.target.style.display = 'none' }} />
                  <p className="text-sm font-space font-black text-white px-1 leading-tight">{match.home_team}</p>
                </div>
                <div className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">VS</div>
                <div className="text-center flex-1 flex flex-col items-center">
                  <img src={getFlagUrl(match.away_team)} alt={match.away_team} className="w-8 h-5.5 rounded object-cover mb-2 shadow-sm" onError={(e) => { e.target.style.display = 'none' }} />
                  <p className="text-sm font-space font-black text-white px-1 leading-tight">{match.away_team}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between mt-5 gap-4">
                <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate max-w-[200px]" title={match.venue}>
                  <MapPin size={13} className="shrink-0 text-gray-500" />
                  <span className="truncate">{match.venue}</span>
                </p>

                <GlowButton 
                  onClick={() => handlePredictFixture(match)}
                  size="sm" 
                  className="rounded-xl text-xs py-1.5 px-3 whitespace-nowrap shrink-0"
                >
                  <Zap size={13} /> Predict XI
                </GlowButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Calendar}
          title="No Fixtures Found"
          description="Fetching the latest ICC and Bilateral fixture list from datasets."
        />
      )}
    </div>
  )
}

export default Fixtures
