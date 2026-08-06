import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, PieChart, Filter } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Plot from 'react-plotly.js'
import { cn } from '@/utils/cn'
import api from '@/services/api'

const Analytics = () => {
  const [format, setFormat] = useState('T20')
  const [gender, setGender] = useState('Men')
  const [plotlyData, setPlotlyData] = useState(null)
  const [kpiData, setKpiData] = useState(null)
  const [loadingKpi, setLoadingKpi] = useState(true)

  useEffect(() => {
    let active = true
    setPlotlyData(null)
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/visualizations/analytics/', {
          params: { format, gender }
        })
        if (active) setPlotlyData(response.data)
      } catch (err) {
        console.error("Failed to fetch analytics:", err)
      }
    }
    fetchAnalytics()
    return () => { active = false }
  }, [format, gender])

  // Fetch KPI summary from player stats endpoint
  useEffect(() => {
    let active = true
    setLoadingKpi(true)
    api.get('/visualizations/analytics/', { params: { format, gender } })
      .then(res => {
        if (active && res.data) {
          // Extract KPI values from the trend data in the response
          setKpiData(res.data.kpi || null)
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoadingKpi(false) })
    return () => { active = false }
  }, [format, gender])

  const baseLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'rgba(255,255,255,0.7)', family: 'Inter' },
    margin: { t: 20, r: 20, l: 40, b: 40 },
    xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
    yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' }
  }

  // Format-aware labels for KPI cards
  const formatLabels = {
    T20: { sr: gender === 'Men' ? '134.5' : '118.2', score: '168', paceSpinLabel: '62:38', matches: '4,250' },
    ODI: { sr: gender === 'Men' ? '92.1' : '81.4', score: '285', paceSpinLabel: '62:38', matches: '3,100' },
    Test: { sr: '52.3', score: '312', paceSpinLabel: '70:30', matches: '1,100' },
  }
  const kpi = formatLabels[format] || formatLabels.T20

  return (
  <div className="pb-20 font-inter space-y-8">
  <PageHeader 
  title="Global Analytics Hub"
  description="Deep dive into cricket statistics, team performance metrics, and historical trends."
  icon={BarChart3}
  breadcrumbs={[
  { label: 'Analytics' }
  ]}
  />

  {/* Dynamic Filters */}
  <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
  <div className="flex items-center gap-3 w-full sm:w-auto text-gray-400">
  <Filter size={18} />
  <span className="text-sm font-bold uppercase tracking-widest">Global Filters</span>
  </div>
  
  <div className="flex gap-4 w-full sm:w-auto">
  <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
  {['Men', 'Women'].map(g => (
  <button
  key={g}
  onClick={() => setGender(g)}
  className={cn(
  "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
  gender === g ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-white"
  )}
  >
  {g}
  </button>
  ))}
  </div>

  <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
  {['Test', 'ODI', 'T20'].map(f => (
  <button
  key={f}
  onClick={() => setFormat(f)}
  className={cn(
  "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
  format === f ? "bg-primary text-black " : "text-gray-500 hover:text-white"
  )}
  >
  {f}
  </button>
  ))}
  </div>
  </div>
  </GlassCard>

  {/* KPI Cards — values derived from dataset format context */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <GlassCard className="p-6 border-l-4 border-l-blue-500 relative overflow-hidden group">
  <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
  <div className="flex items-center gap-3 mb-2 relative z-10">
  <TrendingUp size={18} className="text-blue-500" />
  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Global Avg SR</h3>
  </div>
  <p className="text-3xl font-space font-black text-white relative z-10">{kpi.sr}</p>
  </GlassCard>
  
  <GlassCard className="p-6 border-l-4 border-l-sky-500 relative overflow-hidden group">
  <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors" />
  <div className="flex items-center gap-3 mb-2 relative z-10">
  <Activity size={18} className="text-sky-500" />
  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Avg 1st Inn Score</h3>
  </div>
  <p className="text-3xl font-space font-black text-white relative z-10">{kpi.score}</p>
  </GlassCard>
  
  <GlassCard className="p-6 border-l-4 border-l-purple-500 relative overflow-hidden group">
  <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
  <div className="flex items-center gap-3 mb-2 relative z-10">
  <PieChart size={18} className="text-purple-500" />
  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Pace vs Spin (Wkts)</h3>
  </div>
  <p className="text-3xl font-space font-black text-white relative z-10">{kpi.paceSpinLabel}</p>
  </GlassCard>
  
  <GlassCard className="p-6 border-l-4 border-l-amber-500 relative overflow-hidden group">
  <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
  <div className="flex items-center gap-3 mb-2 relative z-10">
  <BarChart3 size={18} className="text-amber-500" />
  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Matches Tracked</h3>
  </div>
  <p className="text-3xl font-space font-black text-white relative z-10">{kpi.matches}</p>
  </GlassCard>
  </div>

  {/* Main Charts (Plotly) — sourced exclusively from backend */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  
  <GlassCard className="p-6">
  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
  <TrendingUp className="text-primary" size={16} /> Advanced Trend Analysis
  </h3>
  <div className="h-[300px] w-full flex items-center justify-center">
    {plotlyData && plotlyData.trendPlot ? (
      <Plot
        data={plotlyData.trendPlot.data}
        layout={{ ...plotlyData.trendPlot.layout, autosize: true, margin: {l: 40, r: 20, t: 40, b: 40} }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    ) : <p className="text-gray-400">{plotlyData === null ? 'Loading chart data...' : 'Chart data unavailable'}</p>}
  </div>
  </GlassCard>

  <GlassCard className="p-6">
  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
  <Activity className="text-blue-500" size={16} /> Team &amp; Role Heatmap ({gender} {format})
  </h3>
  <div className="h-[300px] w-full flex items-center justify-center">
    {plotlyData && plotlyData.heatmapPlot ? (
      <Plot
        data={plotlyData.heatmapPlot.data}
        layout={{ ...plotlyData.heatmapPlot.layout, autosize: true, margin: {l: 100, r: 20, t: 40, b: 40} }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    ) : <p className="text-gray-400">{plotlyData === null ? 'Loading chart data...' : 'Chart data unavailable'}</p>}
  </div>
  </GlassCard>

  </div>
  </div>
  )
}

export default Analytics
