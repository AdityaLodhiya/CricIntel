import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, MapPin, Users, Info, Shield, Check, Brain, Lightbulb } from 'lucide-react'
import Plot from 'react-plotly.js'
import api from '@/services/api'
import { useMatchStore } from '@/store/matchStore'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import GlowButton from '@/components/ui/GlowButton'
import PlayingXIReveal from './PlayingXIReveal'
import toast from 'react-hot-toast'

// Get XI composition suggestions from venue stats (backend-derived)
function getXiSuggestions(venueStats, format) {
  if (!venueStats) return []
  const suggestions = []
  const pace = parseInt(venueStats.paceWickets) || 55
  const spin = parseInt(venueStats.spinWickets) || 45
  const avg1st = venueStats.avg1stInn || 165
  if (pace >= 65) {
    suggestions.push({ icon: '🏏', text: 'Pick 3+ fast bowlers — pace dominates here', type: 'pace' })
  } else if (spin >= 50) {
    suggestions.push({ icon: '🌀', text: 'Include 2+ specialist spinners — spin-friendly conditions', type: 'spin' })
  }
  if (avg1st >= 280 && format === 'ODI') {
    suggestions.push({ icon: '💥', text: 'High-scoring ground — consider an extra batting all-rounder', type: 'bat' })
  } else if (avg1st >= 180 && format === 'T20') {
    suggestions.push({ icon: '💥', text: 'High-scoring T20 venue — prioritize power-hitters', type: 'bat' })
  }
  if (format === 'Test') {
    suggestions.push({ icon: '🛡️', text: 'Test match — balanced XI with 5 bowlers recommended for longer spells', type: 'test' })
  }
  return suggestions
}

const Prediction = () => {
 const navigate = useNavigate()
  const matchStore = useMatchStore()
  const setMatchDetails = matchStore.setMatchDetails
  const [isGenerating, setIsGenerating] = useState(false)
  const [predictionData, setPredictionData] = useState(matchStore.predictionData)

  // Local state for configuration if not set globally
  const [config, setConfig] = useState({
    homeTeam: matchStore.homeTeam || 'India',
    awayTeam: matchStore.awayTeam || 'Australia',
    venue: matchStore.venue || 'Wankhede Stadium, Mumbai',
    format: matchStore.format || 'T20',
    gender: matchStore.gender || 'Men'
  })

  const [venues, setVenues] = useState(null)  // null = loading
  const [teams, setTeams] = useState(null)      // null = loading
  const [venueStats, setVenueStats] = useState(null)

  useEffect(() => {
    let active = true
    api.get('/venues/').then(res => {
      if (active) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        setVenues(list.length > 0 ? list.map(v => v.name) : [])
      }
    }).catch(() => { if (active) setVenues([]) })
    
    api.get('/visualizations/options/', { params: { format: config.format } }).then(res => {
      if (active && res.data?.teams?.length > 0) {
        const loadedTeams = res.data.teams
        setTeams(loadedTeams)
        // Auto-select valid teams from the loaded list if current config values are missing
        setConfig(prev => {
          const homeValid = loadedTeams.includes(prev.homeTeam)
          const awayValid = loadedTeams.includes(prev.awayTeam)
          return {
            ...prev,
            homeTeam: homeValid ? prev.homeTeam : loadedTeams[0] || prev.homeTeam,
            awayTeam: awayValid ? prev.awayTeam : (loadedTeams[1] || loadedTeams[0] || prev.awayTeam)
          }
        })
      }
    }).catch(() => { if (active) setTeams(['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan', 'Sri Lanka', 'West Indies', 'Bangladesh']) })
    
    return () => { active = false }
  }, [config.format])

  // Fetch venue stats from backend whenever venue or format changes
  useEffect(() => {
    let active = true
    if (config.venue) {
      api.get('/visualizations/venue-stats/', {
        params: { venue: config.venue, format: config.format }
      }).then(res => {
        if (active && res.data?.stats) setVenueStats(res.data.stats)
      }).catch(() => { if (active) setVenueStats(null) })
    }
    return () => { active = false }
  }, [config.venue, config.format])


  const [lastGeneratedConfig, setLastGeneratedConfig] = useState(matchStore.predictionData ? {

    homeTeam: matchStore.homeTeam,
    awayTeam: matchStore.awayTeam,
    venue: matchStore.venue,
    format: matchStore.format,
    gender: matchStore.gender
  } : null)

  const isConfigDirty = lastGeneratedConfig && (
    config.homeTeam !== lastGeneratedConfig.homeTeam ||
    config.awayTeam !== lastGeneratedConfig.awayTeam ||
    config.venue !== lastGeneratedConfig.venue ||
    config.format !== lastGeneratedConfig.format ||
    config.gender !== lastGeneratedConfig.gender
  )

  useEffect(() => {
    // If global store prediction data exists, load it
    if (matchStore.predictionData && !isGenerating) {
      setPredictionData(matchStore.predictionData)
      setLastGeneratedConfig({
        homeTeam: matchStore.homeTeam,
        awayTeam: matchStore.awayTeam,
        venue: matchStore.venue,
        format: matchStore.format,
        gender: matchStore.gender
      })
    }
  }, [matchStore.predictionData, matchStore.homeTeam, matchStore.awayTeam, matchStore.venue, matchStore.format, matchStore.gender])

  const venueData = useMemo(() => {
    if (venueStats) return {
      avg1st: venueStats.avg1stInn || 165,
      avg2nd: venueStats.avg2ndInn || 150,
      pace: parseInt(venueStats.paceWickets) || 55,
      spin: parseInt(venueStats.spinWickets) || 45,
      toss: venueStats.winBatFirst && parseInt(venueStats.winBatFirst) > 50 ? 'Bat First' : 'Chase Favored',
      winBat: venueStats.winBatFirst || 'N/A',
      winBowl: venueStats.winBowlFirst || 'N/A',
    }
    return null  // null = still loading
  }, [venueStats])

  // XI suggestions derived from backend venue stats
  const suggestions = useMemo(() => {
    return getXiSuggestions(venueStats, config.format)
  }, [venueStats, config.format])

  const handleGenerate = async () => {
    if (config.homeTeam === config.awayTeam) {
      toast.error('Teams must be different')
      return
    }

    setIsGenerating(true)
    setPredictionData(null)

    try {
      // 1. Fetch XI prediction from backend /api/predict/
      const predictRes = await api.post('/predict/', {
        homeTeam: config.homeTeam,
        awayTeam: config.awayTeam,
        format: config.format,
        gender: config.gender,
        venue: config.venue,
        opponent: config.awayTeam,
        match_date: new Date().toISOString().split('T')[0]
      })

      const rawResult = predictRes.data

      // Normalize backend response shape: teamA.xi / teamB.xi -> playingXI.home / away
      const predictionResult = {
        ...rawResult,
        playingXI: {
          home: rawResult.playingXI?.home || rawResult.teamA?.xi || [],
          away: rawResult.playingXI?.away || rawResult.teamB?.xi || [],
        }
      }

      // 2. Fetch AI analysis & win probabilities from backend /api/visualizations/prediction-analysis/
      let analysisData = null
      try {
        const analysisRes = await api.get('/visualizations/prediction-analysis/', {
          params: {
            homeTeam: config.homeTeam,
            awayTeam: config.awayTeam,
            format: config.format,
            gender: config.gender,
            venue: config.venue
          }
        })
        analysisData = analysisRes.data
      } catch (err) {
        console.warn('Visualization analysis endpoint error:', err)
      }

      // Extract win probabilities from the Plotly pie chart data for fallback bar rendering
      if (analysisData?.winProbabilityPlot?.data?.[0]?.values) {
        const pLabels = analysisData.winProbabilityPlot.data[0].labels || []
        const pValues = analysisData.winProbabilityPlot.data[0].values || []
        const hi = pLabels.findIndex(l => l === config.homeTeam)
        const ai = pLabels.findIndex(l => l === config.awayTeam)
        if (hi !== -1 && ai !== -1) {
          predictionResult.winProbability = {
            home: Math.round(pValues[hi]),
            away: Math.round(pValues[ai])
          }
        }
      }

      predictionResult.analysisData = analysisData || {
        winProbabilityPlot: null,
        insights: [
          { icon: '🏟️', title: `Venue Analysis: ${config.venue.split(',')[0]}`, text: `${config.format} match at ${config.venue}. Tactical composition updated.` },
          { icon: '🪙', title: 'Toss Strategy', text: `Toss decision dependent on pitch surface and weather conditions.` }
        ]
      }

      setPredictionData(predictionResult)
      setMatchDetails({ ...config, predictionData: predictionResult })
      setLastGeneratedConfig({ ...config })
      toast.success('Prediction Generated Successfully', {
        icon: '🎯',
        style: { borderRadius: '10px', background: '#030305', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      })
    } catch (error) {
      toast.error('Failed to generate prediction: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsGenerating(false)
    }
  }



 return (
 <div className="pb-20">
 <PageHeader 
 title="AI Predictor"
 description="Configure match parameters to generate SHAP-explained optimal Playing XIs and real-time win probabilities."
 icon={Zap}
 breadcrumbs={[
 { label: 'Predictor' }
 ]}
 />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Column: Config Panel */}
 <div className="lg:col-span-1 space-y-6">
 <GlassCard className="p-6">
 <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-primary" />
 Match Parameters
 </h3>

  <div className="space-y-5">
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Gender</label>
      <div className="flex bg-black/50 border border-white/10 rounded-xl p-1">
        {['Men', 'Women'].map(g => (
          <button
            key={g}
            onClick={() => setConfig({...config, gender: g})}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${config.gender === g ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
    
    <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Format</label>
 <div className="flex bg-black/50 border border-white/10 rounded-xl p-1">
 {['T20', 'ODI', 'Test'].map(f => (
 <button
 key={f}
 onClick={() => setConfig({...config, format: f})}
 className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${config.format === f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
 >
 {f}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Home Team</label>
 {teams === null ? (
   <div className="h-10 rounded-xl bg-white/5 animate-pulse border border-white/10" />
 ) : (
 <select
 value={config.homeTeam}
 onChange={(e) => setConfig({...config, homeTeam: e.target.value})}
 className="glass-select w-full"
 >
 {teams.map(t => (
 <option key={t} value={t} disabled={t === config.awayTeam} className="bg-surface">{t}</option>
 ))}
 </select>
 )}
 </div>

 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Away Team</label>
 {teams === null ? (
   <div className="h-10 rounded-xl bg-white/5 animate-pulse border border-white/10" />
 ) : (
 <select
 value={config.awayTeam}
 onChange={(e) => setConfig({...config, awayTeam: e.target.value})}
 className="glass-select w-full"
 >
 {teams.map(t => (
 <option key={t} value={t} disabled={t === config.homeTeam} className="bg-surface">{t}</option>
 ))}
 </select>
 )}
 </div>

 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Venue</label>
 {venues === null ? (
   <div className="h-10 rounded-xl bg-white/5 animate-pulse border border-white/10" />
 ) : (
 <select
 value={config.venue}
 onChange={(e) => setConfig({...config, venue: e.target.value})}
 className="glass-select w-full"
 >
 {venues.map(v => (
 <option key={v} value={v} className="bg-surface">{v}</option>
 ))}
 </select>
 )}
 </div>

 <div className="pt-4">
 <GlowButton 
 onClick={handleGenerate} 
 isLoading={isGenerating} 
 className="w-full"
 >
 {isGenerating ? 'Running Models...' : 'Run Prediction Engine'}
 </GlowButton>
 </div>
 </div>
 </GlassCard>

 {/* Contextual Intelligence */}
 <GlassCard variant="blue" className="p-6">
 <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
 <MapPin size={16} className="text-blue-400" />
 Venue Intelligence
 <span className="ml-auto text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{config.format}</span>
 </h3>
 <div className="space-y-3">
 {venueData === null ? (
   [1,2,3,4].map(i => (
     <div key={i} className="flex justify-between items-center border-b border-blue-500/10 pb-2">
       <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
       <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
     </div>
   ))
 ) : (
   <>
 <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
 <span className="text-xs text-gray-400">Avg 1st Inn Score</span>
 <span className="text-sm font-bold text-white">{venueData.avg1st}</span>
 </div>
 <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
 <span className="text-xs text-gray-400">Avg 2nd Inn Score</span>
 <span className="text-sm font-bold text-white">{venueData.avg2nd}</span>
 </div>
 <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
 <span className="text-xs text-gray-400">Pace vs Spin</span>
 <span className="text-sm font-bold text-white">{venueData.pace}% / {venueData.spin}%</span>
 </div>
 <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
 <span className="text-xs text-gray-400">Win Batting First</span>
 <span className="text-xs font-bold text-green-400">{venueData.winBat}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-xs text-gray-400">Toss Impact</span>
 <span className={`text-xs font-bold ${venueData.toss === 'Chase Favored' ? 'text-sky-400' : 'text-blue-400'}`}>{venueData.toss}</span>
 </div>
   </>
 )}
 </div>
 </GlassCard>

 {/* XI Suggestions */}
 {suggestions.length > 0 && (
 <GlassCard variant="purple" className="p-6">
 <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
 <Lightbulb size={16} className="text-yellow-400" />
 XI Composition Tips
 </h3>
 <div className="space-y-3">
 {suggestions.map((s, idx) => (
  <div key={idx} className="flex gap-3 items-start bg-white/[0.02] p-3 rounded-xl border border-white/[0.02]">
  <span className="text-lg shrink-0">{s.icon}</span>
  <p className="text-xs text-gray-300 leading-relaxed">{s.text}</p>
  </div>
 ))}
 </div>
 </GlassCard>
 )}
 </div>

 {/* Right Column: Results Area */}
 <div className="lg:col-span-2">
 {!predictionData && !isGenerating ? (
 <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/[0.01]">
 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
 <Brain size={32} className="text-gray-500" />
 </div>
 <h3 className="text-xl font-space font-bold text-white mb-2">Awaiting Parameters</h3>
 <p className="text-sm text-gray-400 max-w-sm">Configure the match parameters on the left and run the prediction engine to generate the AI Playing XI.</p>
 </div>
 ) : isConfigDirty && !isGenerating ? (
 <div className="h-full min-h-[400px] border border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-primary/5">
 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
 <Zap size={32} className="text-primary" />
 </div>
 <h3 className="text-xl font-space font-bold text-white mb-2">Configuration Changed</h3>
 <p className="text-sm text-gray-400 max-w-sm">Run the predict engine to see the updated AI Playing XI and dynamic matchups for this new configuration.</p>
 </div>
 ) : isGenerating ? (
 <div className="h-full min-h-[400px] border border-primary/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-primary/5 shadow-[inset_0_0_100px_rgba(59,130,246,0.05)] relative overflow-hidden">
 {/* Scanning Line Animation */}
 <motion.div 
 animate={{ top: ['0%', '100%', '0%'] }}
 transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
 className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_20px_rgba(59,130,246,1)] z-10"
 />
 <div className="w-20 h-20 rounded-full border-t-2 border-primary animate-spin mb-6" />
 <h3 className="text-2xl font-space font-black text-white mb-2">Analyzing 50+ Features</h3>
 <p className="text-sm text-primary animate-pulse">Calculating SHAP values and win probabilities...</p>
 </div>
 ) : (
  <div className="space-y-6">
   {/* Win Probability Pie Chart & Key Insights */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     <GlassCard className="p-4 flex flex-col h-[350px]">
       <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 px-2">Win Probability</h3>
       {(() => {
          // Extract real probabilities from the backend response
          const plotData = predictionData.analysisData?.winProbabilityPlot?.data
          
          if (plotData?.[0]?.values) {
            return (
              <div className="flex-1 w-full relative h-[250px] mt-4">
                <Plot
                  data={predictionData.analysisData.winProbabilityPlot.data}
                  layout={{
                    ...predictionData.analysisData.winProbabilityPlot.layout,
                    autosize: true,
                    margin: { t: 0, b: 0, l: 0, r: 0 }
                  }}
                  useResizeHandler={true}
                  style={{ width: '100%', height: '100%' }}
                  config={{ displayModeBar: false }}
                />
              </div>
            )
          }

          let homeProb = predictionData.winProbability?.home ?? null
          let awayProb = predictionData.winProbability?.away ?? null
          
          // Ultimate AI Fallback computation
          if (homeProb === null || awayProb === null || isNaN(homeProb) || isNaN(awayProb)) {
            const ratings = { 'India': 1720, 'Australia': 1680, 'England': 1620, 'South Africa': 1600, 'New Zealand': 1560, 'Pakistan': 1550, 'West Indies': 1490, 'Sri Lanka': 1480, 'Bangladesh': 1440 }
            const hr = ratings[config.homeTeam] || 1500
            const ar = ratings[config.awayTeam] || 1500
            const rawProb = 1.0 / (1.0 + Math.pow(10, (ar - hr) / 400.0))
            homeProb = Math.round(rawProb * 100)
            awayProb = 100 - homeProb
          }
          return (
            <div className="flex-1 flex flex-col justify-center px-4 space-y-6 mt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold text-sm">{config.homeTeam}</span>
                  <span className="text-primary font-black text-2xl">{homeProb}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${homeProb}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-400 uppercase tracking-widest">VS</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold text-sm">{config.awayTeam}</span>
                  <span className="text-purple-400 font-black text-2xl">{awayProb}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${awayProb}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          )
        })()}
     </GlassCard>

     <GlassCard variant="purple" className="p-6 overflow-y-auto max-h-[350px] scrollbar-hide">
       <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
         <Shield size={16} className="text-purple-400" />
         AI Predictive Insights
       </h3>
       <div className="space-y-4">
         {predictionData.analysisData?.insights?.map((insight, idx) => (
           <motion.div 
             key={idx}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 + (idx * 0.1) }}
             className="flex gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.02] hover:bg-white/[0.04] transition-colors"
           >
             <span className="text-xl shrink-0 mt-1">{insight.icon}</span>
             <div>
               <p className="text-sm font-bold text-gray-200 mb-1">{insight.title}</p>
               <p className="text-xs text-gray-400 leading-relaxed">{insight.text}</p>
             </div>
           </motion.div>
         ))}
       </div>
     </GlassCard>
   </div>

 {/* Dynamic Matchups Link */}
 <div className="flex justify-center mt-8 mb-4">
 <GlowButton 
 onClick={() => navigate('/app/dynamic-matchups')} 
 className="w-full md:w-auto px-12 py-4"
 >
 View Dynamic Matchups
 </GlowButton>
 </div>

 {/* Playing XI Reveal */}
 <PlayingXIReveal 
 homeXI={predictionData?.playingXI?.home || []} 
 awayXI={predictionData?.playingXI?.away || []}
 matchDetails={config}
 />

 </div>
 )}
 </div>
 </div>
 </div>
 )
}

export default Prediction
