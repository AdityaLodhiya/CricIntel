import React, { useState, useEffect } from 'react'
import { MapPin, Target, TrendingUp, Droplets } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/utils/cn'
import api from '@/services/api'

const Venues = () => {
  const [venuesList, setVenuesList] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('T20')
  const [liveStats, setLiveStats] = useState(null)

  useEffect(() => {
    let active = true
    api.get('/venues/').then(res => {
      if (active) {
        // Backend returns {count, results} or array
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        if (list.length > 0) {
          setVenuesList(list)
          setSelectedVenue(list[0])
        }
      }
    }).catch(err => {
      console.error("Failed to fetch venues list:", err)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedVenue) return
    let active = true
    api.get('/visualizations/venue-stats/', {
      params: { venue: selectedVenue.name, format: selectedFormat }
    }).then(res => {
      if (active && res.data?.stats) {
        setLiveStats(res.data.stats)
      }
    }).catch(() => {
      if (active) setLiveStats(null)
    })
    return () => { active = false }
  }, [selectedVenue, selectedFormat])

  if (!selectedVenue) {
    return <div className="p-8 text-center text-gray-400">Loading stadium venues...</div>
  }

  const paceVal = liveStats ? parseInt(liveStats.paceWickets) : parseInt(selectedVenue.paceWickets)
  const spinVal = liveStats ? parseInt(liveStats.spinWickets) : parseInt(selectedVenue.spinWickets)

  const paceSpinData = [
    { name: 'Pace', value: paceVal },
    { name: 'Spin', value: spinVal },
  ]
  const COLORS = ['#3B82F6', '#0EA5E9']

  const displayAvg1st = liveStats ? liveStats.avg1stInn : (selectedFormat === 'Test' ? parseInt(selectedVenue.avg1stInn) * 1.8 + 30 : selectedFormat === 'ODI' ? parseInt(selectedVenue.avg1stInn) + 110 : selectedVenue.avg1stInn);
  const displayAvg2nd = liveStats ? liveStats.avg2ndInn : (selectedFormat === 'Test' ? parseInt(selectedVenue.avg2ndInn) * 1.8 + 25 : selectedFormat === 'ODI' ? parseInt(selectedVenue.avg2ndInn) + 105 : selectedVenue.avg2ndInn);


  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader 
        title="Venue Intelligence"
        description="Pitch conditions, historical par scores, and toss analysis dynamically adapted to match format."
        icon={MapPin}
        breadcrumbs={[
          { label: 'Venues' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Venue List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Select Stadium</h3>
          {venuesList.map(venue => (

            <button
              key={venue.id}
              onClick={() => setSelectedVenue(venue)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3",
                selectedVenue.id === venue.id 
                  ? "bg-primary/10 border-primary " 
                  : "bg-white/[0.02] border-white/5 hover:border-white/20"
              )}
            >
              <MapPin size={18} className={selectedVenue.id === venue.id ? "text-primary" : "text-gray-500"} />
              <div>
                <p className="text-white font-bold text-sm truncate">{venue.name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{venue.city}, {venue.country}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Venue Analysis */}
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-space font-black text-white">{selectedVenue.name}</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                  <MapPin size={14} /> {selectedVenue.city}, {selectedVenue.country}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex bg-black/50 border border-white/10 rounded-xl p-1">
                  {['T20', 'ODI', 'Test'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${selectedFormat === f ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="bg-black/50 border border-white/10 px-4 py-2 rounded-xl text-center flex items-center gap-3">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Status</p>
                  <p className="text-sm text-primary font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Active
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Target size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Avg 1st Inn</p>
                </div>
                <p className="text-3xl font-space font-black text-white">{Math.round(displayAvg1st)}</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <TrendingUp size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Avg 2nd Inn</p>
                </div>
                <p className="text-3xl font-space font-black text-white">{Math.round(displayAvg2nd)}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Droplets size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Win Bat 1st</p>
                </div>
                <p className="text-3xl font-space font-black text-blue-400">{selectedVenue.winBatFirst}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <TrendingUp size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Win Bowl 1st</p>
                </div>
                <p className="text-3xl font-space font-black text-purple-400">{selectedVenue.winBowlFirst}</p>
              </div>
            </div>
          </GlassCard>

 {/* Charts Row */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <GlassCard className="p-6">
 <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-center">Pace vs Spin Dependency</h3>
 <div className="h-[200px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={paceSpinData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={80}
 paddingAngle={5}
 dataKey="value"
 >
 {paceSpinData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip 
 contentStyle={{ backgroundColor: 'rgba(10,11,16,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
 itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="flex justify-center gap-6 mt-4">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
 <span className="text-xs text-gray-400 font-bold uppercase">Pace ({selectedVenue.paceWickets})</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-sky-500"></div>
 <span className="text-xs text-gray-400 font-bold uppercase">Spin ({selectedVenue.spinWickets})</span>
 </div>
 </div>
 </GlassCard>
 
 <GlassCard className="p-6 flex flex-col justify-center text-center">
 <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Toss Recommendation</h3>
 <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center mb-4 ">
 <Target size={32} className="text-primary" />
 </div>
 <p className="text-2xl font-space font-black text-white">
 {parseInt(selectedVenue.winBatFirst) > 50 ? 'Bat First' : 'Bowl First'}
 </p>
 <p className="text-sm text-gray-400 mt-2">Historical trends favor the chasing team under these lights.</p>
 </GlassCard>
 </div>
 </div>
 </div>
 </div>
 )
}

export default Venues
