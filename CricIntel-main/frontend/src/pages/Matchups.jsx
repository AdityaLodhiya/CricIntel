import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Swords, Settings2, MapPin } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Plot from 'react-plotly.js'
import api from '@/services/api'
import GlowButton from '@/components/ui/GlowButton'
import toast from 'react-hot-toast'
import { getFlagUrl } from '@/utils/constants'
import { useMatchStore } from '@/store/matchStore'

const Matchups = () => {
  const location = useLocation()
  const matchStore = useMatchStore()
  const setMatchDetails = matchStore.setMatchDetails
  
  const [config, setConfig] = useState({
    teamA: location.state?.homeTeam || matchStore.homeTeam || 'India',
    teamB: location.state?.awayTeam || matchStore.awayTeam || 'Australia',
    gender: location.state?.gender || matchStore.gender || 'Men',
    format: location.state?.format || matchStore.format || 'T20',
    venue: location.state?.venue || matchStore.venue || 'Wankhede Stadium, Mumbai'
  })

  const [plotlyData, setPlotlyData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Initial load
  useEffect(() => {
    handleGenerate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async () => {
    if (config.teamA === config.teamB) {
      toast.error("Teams cannot be the same.")
      return
    }

    setIsGenerating(true)
    try {
      setMatchDetails({ homeTeam: config.teamA, awayTeam: config.teamB, format: config.format, gender: config.gender, venue: config.venue })
      
      const response = await api.get('/visualizations/matchup-radar/', {
        params: {
          teamA: config.teamA,
          teamB: config.teamB,
          format: config.format,
          gender: config.gender
        }
      })
      
      if (response.data) {
        setPlotlyData(response.data)
        toast.success("Matchups generated successfully")
      } else {
        setPlotlyData(null)
      }
    } catch (error) {
      toast.error("Failed to load matchup analytics from backend: " + (error.response?.data?.error || error.message))
      setPlotlyData(null)
    } finally {
      setIsGenerating(false)
    }
  }



  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader 
        title="Head-to-Head Matchups"
        description="Historical player vs player records and statistical dominance."
        icon={Swords}
        breadcrumbs={[
          { label: 'Matchups' }
        ]}
      />

      {/* Configuration Panel - Manual Sandbox */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 size={20} className="text-primary" />
          <h2 className="text-lg font-space font-black text-white">Matchup Configuration Sandbox</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Gender</label>
            <div className="flex bg-white/5 rounded-xl p-1 relative">
              <div 
                className="absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300 ease-out"
                style={{ left: config.gender === 'Men' ? '4px' : 'calc(50% + 2px)' }}
              />
              {['Men', 'Women'].map(g => (
                <button
                  key={g}
                  onClick={() => setConfig({...config, gender: g})}
                  className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${config.gender === g ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Format</label>
            <div className="flex bg-white/5 rounded-xl p-1 relative">
              <div 
                className="absolute inset-y-1 w-[calc(33.33%-4px)] bg-primary rounded-lg transition-all duration-300 ease-out"
                style={{ 
                  left: config.format === 'Test' ? '4px' : 
                        config.format === 'ODI' ? 'calc(33.33% + 2px)' : 
                        'calc(66.66%)' 
                }}
              />
              {['Test', 'ODI', 'T20'].map(f => (
                <button
                  key={f}
                  onClick={() => setConfig({...config, format: f})}
                  className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${config.format === f ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Team A (Batting)</label>
            <select 
              value={config.teamA} 
              onChange={(e) => setConfig({...config, teamA: e.target.value})}
              className="glass-select w-full"
            >
              {['India', 'Australia', 'England', 'South Africa', 'New Zealand'].map(t => (
                <option key={t} value={t} disabled={t === config.teamB} className="bg-surface">{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Team B (Bowling)</label>
            <select 
              value={config.teamB} 
              onChange={(e) => setConfig({...config, teamB: e.target.value})}
              className="glass-select w-full"
            >
              {['Australia', 'India', 'England', 'South Africa', 'New Zealand'].map(t => (
                <option key={t} value={t} disabled={t === config.teamA} className="bg-surface">{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end pb-1">
            <GlowButton onClick={handleGenerate} isLoading={isGenerating} className="w-full">
              {isGenerating ? 'Generating...' : 'Load Matchups'}
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {plotlyData && plotlyData.metadata ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matchup Selector List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Swords size={16} className="text-primary" />
              Key Face-offs
            </h3>
            
            <div className="space-y-3">
              <GlassCard 
                className={`p-4 cursor-pointer transition-all border-primary bg-primary/5`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left flex items-center gap-2">
                    <img src={getFlagUrl(plotlyData.metadata.batterTeam)} alt={plotlyData.metadata.batterTeam} className="w-5 h-3.5 rounded object-cover" />
                    <div>
                      <p className="text-sm font-bold text-white">{plotlyData.metadata.batter}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{plotlyData.metadata.batterTeam}</p>
                    </div>
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">VS</span>
                  </div>
                  <div className="text-right flex items-center gap-2 flex-row-reverse">
                    <img src={getFlagUrl(plotlyData.metadata.bowlerTeam)} alt={plotlyData.metadata.bowlerTeam} className="w-5 h-3.5 rounded object-cover" />
                    <div>
                      <p className="text-sm font-bold text-white">{plotlyData.metadata.bowler}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{plotlyData.metadata.bowlerTeam}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Venue Matchup Context */}
            <GlassCard variant="blue" className="p-5 mt-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-blue-400" />
                Context
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Selected Match</span>
                  <span className="text-white font-bold">{config.teamA} vs {config.teamB}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Format & Gender</span>
                  <span className="text-white font-bold">{config.format} ({config.gender})</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Matchup Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Head to Head Summary */}
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 text-center">Historical Record ({config.format})</h3>
                
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
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Runs Distribution by Zone</h3>
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
          </div>
        </div>
      ) : (
        !isGenerating && (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400">No matchups found for this configuration.</p>
          </GlassCard>
        )
      )}

      {/* 
        NOTE FOR FUTURE: When upcoming fixtures dataset is added, 
        this entire page should be made dynamic (similar to DynamicMatchups.jsx) 
        where it automatically loads the matchup based on the fixture parameters 
        (Team A vs Team B, format, men/women, venue).
        The manual configuration panel above can either be removed or hidden behind an "Advanced Search" toggle.
      */}
    </div>
  )
}

export default Matchups
