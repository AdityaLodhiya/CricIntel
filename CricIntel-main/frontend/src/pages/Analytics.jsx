import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, PieChart, Filter } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Plot from 'react-plotly.js'
import { cn } from '@/utils/cn'
import api from '@/services/api'

const SkeletonKpi = () => (
  <GlassCard className="p-6 border-l-4 border-l-gray-600 relative overflow-hidden">
    <div className="flex justify-between items-center mb-2">
      <div className="h-4 w-6 bg-white/10 rounded animate-pulse" />
      <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
    </div>
    <div className="h-8 w-20 bg-white/10 rounded animate-pulse mt-2" />
  </GlassCard>
)

const SkeletonChart = ({ label }) => (
  <GlassCard className="p-6">
    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
      <div className="w-4 h-4 bg-white/10 rounded animate-pulse" /> {label}
    </h3>
    <div className="h-[300px] w-full bg-white/5 rounded-xl animate-pulse" />
  </GlassCard>
)

const Analytics = () => {
  const [format, setFormat] = useState('T20')
  const [gender, setGender] = useState('Men')
  const [plotlyData, setPlotlyData] = useState(null)
  const [kpiData, setKpiData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/visualizations/analytics/', {
          params: { format, gender }
        })
        if (active) {
          setPlotlyData(response.data)
          setKpiData(response.data.kpi || null)
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchAnalytics()
    return () => { active = false }
  }, [format, gender])

  const kpi = kpiData || { sr: '—', score: '—', paceSpinLabel: '—', matches: '—' }

  return (
    <div className="pb-20 font-inter space-y-8">
      <PageHeader 
        title="Global Analytics Hub"
        description="Deep dive into cricket statistics, team performance metrics, and historical trends directly from datasets."
        icon={BarChart3}
        breadcrumbs={[
          { label: 'Analytics' }
        ]}
      />

      {/* Dynamic Filters */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto text-gray-400">
          <Filter size={18} className="text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Global Filters</span>
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 shadow-inner">
            {['Men', 'Women'].map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  gender === g ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" : "text-gray-500 hover:text-white"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 shadow-inner">
            {['Test', 'ODI', 'T20'].map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  format === f ? "bg-primary text-black shadow-sm ring-1 ring-primary/50" : "text-gray-500 hover:text-white"
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
        {loading ? (
          <>
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
          </>
        ) : (
          <>
            <GlassCard className="p-6 border-l-4 border-l-blue-500 relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all">
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <TrendingUp size={18} className="text-blue-500" />
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Global Avg SR</h3>
              </div>
              <p className="text-3xl font-space font-black text-white relative z-10">{kpi.sr}</p>
            </GlassCard>
            
            <GlassCard className="p-6 border-l-4 border-l-sky-500 relative overflow-hidden group hover:shadow-lg hover:shadow-sky-500/10 transition-all">
              <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <Activity size={18} className="text-sky-500" />
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Avg 1st Inn Score</h3>
              </div>
              <p className="text-3xl font-space font-black text-white relative z-10">{kpi.score}</p>
            </GlassCard>
            
            <GlassCard className="p-6 border-l-4 border-l-purple-500 relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all">
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <PieChart size={18} className="text-purple-500" />
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Pace vs Spin (Wkts)</h3>
              </div>
              <p className="text-3xl font-space font-black text-white relative z-10">{kpi.paceSpinLabel}</p>
            </GlassCard>
            
            <GlassCard className="p-6 border-l-4 border-l-amber-500 relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/10 transition-all">
              <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <BarChart3 size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Matches Tracked</h3>
              </div>
              <p className="text-3xl font-space font-black text-white relative z-10">{kpi.matches}</p>
            </GlassCard>
          </>
        )}
      </div>

      {/* Main Charts (Plotly) — sourced exclusively from backend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {loading ? (
          <SkeletonChart label="Advanced Trend Analysis" />
        ) : (
          <GlassCard className="p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow border-white/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="text-primary" size={16} /> Advanced Trend Analysis
            </h3>
            <div className="h-[320px] w-full flex items-center justify-center">
              {plotlyData && plotlyData.trendPlot ? (
                <Plot
                  data={plotlyData.trendPlot.data}
                  layout={{ ...plotlyData.trendPlot.layout, autosize: true, margin: {l: 40, r: 20, t: 40, b: 40} }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "100%" }}
                  config={{ displayModeBar: false, responsive: true }}
                />
              ) : <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">Chart data unavailable</p>}
            </div>
          </GlassCard>
        )}

        {loading ? (
          <SkeletonChart label={`Team & Role Heatmap (${gender} ${format})`} />
        ) : (
          <GlassCard className="p-6 hover:shadow-lg hover:shadow-blue-500/5 transition-shadow border-white/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <Activity className="text-blue-500" size={16} /> Team &amp; Role Heatmap ({gender} {format})
            </h3>
            <div className="h-[320px] w-full flex items-center justify-center">
              {plotlyData && plotlyData.heatmapPlot ? (
                <Plot
                  data={plotlyData.heatmapPlot.data}
                  layout={{ ...plotlyData.heatmapPlot.layout, autosize: true, margin: {l: 100, r: 20, t: 40, b: 40} }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "100%" }}
                  config={{ displayModeBar: false, responsive: true }}
                />
              ) : <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">Chart data unavailable</p>}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

export default Analytics
