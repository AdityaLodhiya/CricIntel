import React, { useState, useEffect } from 'react'
import { Calendar, Zap, MapPin, Trophy, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import EmptyState from '@/components/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '@/store/matchStore'
import api from '@/services/api'

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
        <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
          Loading Fixtures...
        </div>
      ) : fixtures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fixtures.map(match => (
            <GlassCard key={match.id} className="p-6 relative overflow-hidden group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {match.format} Series
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <Calendar size={13} /> {match.date}
                </span>
              </div>

              <div className="flex items-center justify-between my-4 px-2">
                <div className="text-center flex-1">
                  <p className="text-xl font-space font-black text-white">{match.home_team}</p>
                </div>
                <div className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">VS</div>
                <div className="text-center flex-1">
                  <p className="text-xl font-space font-black text-white">{match.away_team}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate max-w-[220px]">
                  <MapPin size={13} className="shrink-0 text-gray-500" />
                  <span className="truncate">{match.venue}</span>
                </p>

                <GlowButton 
                  onClick={() => handlePredictFixture(match)}
                  size="sm" 
                  className="rounded-xl text-xs py-2 px-4"
                >
                  <Zap size={14} /> Predict XI
                </GlowButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Calendar}
          title="No Fixtures Found"
          description="Fetching the latest ICC and Bilateral fixture list."
        />
      )}
    </div>
  )
}

export default Fixtures
