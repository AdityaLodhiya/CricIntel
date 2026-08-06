import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swords, ArrowLeft, Info, MapPin, Target } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Plot from 'react-plotly.js'
import api from '@/services/api'
import GlowButton from '@/components/ui/GlowButton'
import { useMatchStore } from '@/store/matchStore'
import { getFlagUrl } from '@/utils/constants'

const DynamicMatchups = () => {
  const navigate = useNavigate()
  const matchStore = useMatchStore()
  
  const [matchups, setMatchups] = useState([])
  const [selectedMatchup, setSelectedMatchup] = useState(null)
  const [plotlyData, setPlotlyData] = useState(null)
  const [venueStats, setVenueStats] = useState(null)
  
  // Fetch venue stats for context card
  useEffect(() => {
    let active = true
    if (matchStore.venue && matchStore.format) {
      api.get('/visualizations/venue-stats/', {
        params: { venue: matchStore.venue, format: matchStore.format }
      }).then(res => {
        if (active && res.data?.stats) setVenueStats(res.data.stats)
      }).catch(() => {})
    }
    return () => { active = false }
  }, [matchStore.venue, matchStore.format])

  useEffect(() => {
    let active = true
    const fetchInitialMatchups = async () => {
      try {
        const response = await api.get('/visualizations/matchup-radar/', {
          params: {
            teamA: matchStore.homeTeam || 'India',
            teamB: matchStore.awayTeam || 'Australia',
            format: matchStore.format || 'T20',
            gender: matchStore.gender || 'Men'
          }
        })
        if (active && response.data) {
          setPlotlyData(response.data)
          if (response.data.matchupsList && response.data.matchupsList.length > 0) {
            setMatchups(response.data.matchupsList)
            setSelectedMatchup(response.data.matchupsList[0])
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial matchup data:", error)
      }
    }
    fetchInitialMatchups()
    return () => { active = false }
  }, [matchStore.homeTeam, matchStore.awayTeam, matchStore.format, matchStore.gender])

  useEffect(() => {
    if (selectedMatchup) {
      const fetchPlotlyData = async () => {
        try {
          const response = await api.get('/visualizations/matchup-radar/', {
            params: {
              teamA: matchStore.homeTeam || 'India',
              teamB: matchStore.awayTeam || 'Australia',
              format: matchStore.format || 'T20',
              gender: matchStore.gender || 'Men',
              batter: selectedMatchup.batter,
              bowler: selectedMatchup.bowler
            }
          })
          setPlotlyData(response.data)
        } catch (error) {
          console.error("Failed to fetch plotly matchup data:", error)
        }
      }
      fetchPlotlyData()
    }
  }, [selectedMatchup, matchStore.homeTeam, matchStore.awayTeam, matchStore.format, matchStore.gender])


  if (!matchStore.predictionData) {
    return (
      <div className="pb-20 font-inter space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Info size={48} className="text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">No Match Context</h2>
        <p className="text-gray-400 text-center max-w-md">Please generate a prediction first in <strong>Predict XI</strong> to view dynamic matchups based on your selected teams, format, and venue.</p>
        <GlowButton onClick={() => navigate('/app/prediction')} className="mt-4">
          Go to Predict XI
        </GlowButton>
      </div>
    )
  }

  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader 
        title="Dynamic Matchups"
        description={`${matchStore.homeTeam} vs ${matchStore.awayTeam} • ${matchStore.gender}'s ${matchStore.format} • ${matchStore.venue}`}
        icon={Swords}
        breadcrumbs={[
          { label: 'Predict XI', to: '/app/prediction' },
          { label: 'Dynamic Matchups' }
        ]}
      />

      {/* Context Banner */}
      <GlassCard className="p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <img src={getFlagUrl(matchStore.homeTeam)} alt={matchStore.homeTeam} className="w-8 h-6 rounded object-cover" />
          <span className="text-sm font-bold text-white">{matchStore.homeTeam}</span>
          <span className="text-xs text-primary font-black">VS</span>
          <span className="text-sm font-bold text-white">{matchStore.awayTeam}</span>
          <img src={getFlagUrl(matchStore.awayTeam)} alt={matchStore.awayTeam} className="w-8 h-6 rounded object-cover" />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 font-bold">{matchStore.gender}</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 font-bold">{matchStore.format}</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 font-bold flex items-center gap-1.5">
            <MapPin size={12} className="text-blue-400" /> {matchStore.venue}
          </span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Matchup Selector List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Swords size={16} className="text-primary" />
            Key Face-offs ({matchups.length})
          </h3>
          
          <div className="space-y-3">
            {matchups.map((matchup) => (
              <GlassCard 
                key={matchup.id}
                className={`p-4 cursor-pointer transition-all ${selectedMatchup?.id === matchup.id ? 'border-primary bg-primary/5' : 'hover:border-white/20'}`}
                onClick={() => setSelectedMatchup(matchup)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left flex items-center gap-2">
                    <img src={getFlagUrl(matchup.batterTeam)} alt={matchup.batterTeam} className="w-5 h-3.5 rounded object-cover" />
                    <div>
                      <p className="text-sm font-bold text-white">{matchup.batter}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{matchup.batterTeam}</p>
                    </div>
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">VS</span>
                  </div>
                  <div className="text-right flex items-center gap-2 flex-row-reverse">
                    <img src={getFlagUrl(matchup.bowlerTeam)} alt={matchup.bowlerTeam} className="w-5 h-3.5 rounded object-cover" />
                    <div>
                      <p className="text-sm font-bold text-white">{matchup.bowler}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{matchup.bowlerTeam}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Venue Matchup Context */}
          <GlassCard variant="blue" className="p-5 mt-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" />
              Venue Matchup Context
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Venue</span>
                <span className="text-white font-bold">{matchStore.venue?.split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg 1st Inn</span>
                <span className="text-white font-bold">{venueStats ? venueStats.avg1stInn : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pace / Spin</span>
                <span className="text-white font-bold">
                  {venueStats ? `${venueStats.paceWickets} / ${venueStats.spinWickets}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Batting First</span>
                <span className="text-sky-400 font-bold">{venueStats ? venueStats.winBatFirst : '—'}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Matchup Details */}
        <div className="lg:col-span-2">
          {plotlyData && plotlyData.metadata ? (
            <div className="space-y-6">
              {/* Head to Head Summary */}
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 text-center">Historical Record at {matchStore.venue?.split(',')[0]}</h3>
                
                <div className="flex justify-between items-center mb-8">
                  <div className="text-center w-1/3">
                    <div className="w-20 h-20 mx-auto rounded-full border border-white/10 flex items-center justify-center mb-3 overflow-hidden shadow-lg bg-black/50">
                      <img src={getFlagUrl(plotlyData.metadata.batterTeam)} alt={plotlyData.metadata.batterTeam} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-lg font-bold text-white">{plotlyData.metadata.batter}</h4>
                    <p className="text-xs text-gray-500 uppercase">Batter • {plotlyData.metadata.batterTeam}</p>
                  </div>
                  
                  <div className="w-1/3 text-center">
                    <Swords size={32} className="text-primary mx-auto opacity-50" />
                  </div>

                  <div className="text-center w-1/3">
                    <div className="w-20 h-20 mx-auto rounded-full border border-white/10 flex items-center justify-center mb-3 overflow-hidden shadow-lg bg-black/50">
                      <img src={getFlagUrl(plotlyData.metadata.bowlerTeam)} alt={plotlyData.metadata.bowlerTeam} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-lg font-bold text-white">{plotlyData.metadata.bowler}</h4>
                    <p className="text-xs text-gray-500 uppercase">Bowler • {plotlyData.metadata.bowlerTeam}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center border-t border-white/10 pt-6">
                  <div>
                    <p className="text-2xl font-space font-black text-white">{plotlyData.metadata.runs}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Runs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-space font-black text-white">{plotlyData.metadata.balls}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balls</p>
                  </div>
                  <div>
                    <p className="text-2xl font-space font-black text-primary">{plotlyData.metadata.outs}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Dismissals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-space font-black text-white">{plotlyData.metadata.strikeRate}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strike Rate</p>
                  </div>
                </div>
              </GlassCard>

              {/* Shot Distribution */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Performance Splits</h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                  {plotlyData.barPlot ? (
                    <Plot
                      data={plotlyData.barPlot.data}
                      layout={{ ...plotlyData.barPlot.layout, autosize: true, margin: {l: 80, r: 20, t: 20, b: 20} }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false, responsive: true }}
                    />
                  ) : <p className="text-gray-400">Chart data not available</p>}
                </div>
              </GlassCard>

              {/* Dominance Radar */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Matchup Dominance</h3>
                <div className="h-[280px] w-full flex items-center justify-center">
                  {plotlyData.radarPlot ? (
                    <Plot
                      data={plotlyData.radarPlot.data}
                      layout={{ ...plotlyData.radarPlot.layout, autosize: true, margin: {l: 40, r: 40, t: 40, b: 40} }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false, responsive: true }}
                    />
                  ) : <p className="text-gray-400">Chart data not available</p>}
                </div>
              </GlassCard>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-3xl flex items-center justify-center bg-white/[0.01]">
              <p className="text-gray-500">Select a matchup to view detailed analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DynamicMatchups
