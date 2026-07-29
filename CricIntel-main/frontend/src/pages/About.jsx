import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Target, Shield, TrendingUp, Users, MapPin, BarChart3, Globe, Code2, Sparkles, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const techStack = [
  { name: 'React', desc: 'Frontend UI', color: '#61DAFB' },
  { name: 'Django', desc: 'REST API', color: '#092E20' },
  { name: 'Scikit-Learn', desc: 'ML Models', color: '#F7931E' },
  { name: 'PostgreSQL', desc: 'Database', color: '#4169E1' },
  { name: 'Framer Motion', desc: 'Animations', color: '#BB4B96' },
  { name: 'Recharts', desc: 'Visualizations', color: '#8884D8' },
]

const features = [
  { icon: Brain, title: 'AI-Powered Predictions', desc: 'Machine learning models trained on 50+ cricket features to predict optimal Playing XIs with SHAP explainability.' },
  { icon: Target, title: 'Match Outcome Forecasting', desc: 'Win probability predictions calibrated across thousands of historical T20, ODI, and Test matches.' },
  { icon: Users, title: 'Player Matchup Analysis', desc: 'Head-to-head batter vs bowler stats with dismissal patterns, strike rates, and economy breakdowns.' },
  { icon: MapPin, title: 'Venue Intelligence', desc: 'Pitch behavior mapping, weather impact, average scores, and bowling suitability analysis for every venue.' },
  { icon: Shield, title: 'Team Balance Optimization', desc: 'AI suggestions for extra spinner or pacer based on venue conditions, weather, and opponent weaknesses.' },
  { icon: BarChart3, title: 'SHAP Feature Importance', desc: 'Transparent AI — see exactly which factors (form, fitness, matchups) drove each prediction.' },
]

const team = [
  { name: 'Rudra Bhavsar', role: 'Lead Developer', specialty: 'Full-Stack & ML' },
]

const About = () => {
  return (
    <div className="space-y-16 pb-16 font-inter max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 text-[10px] font-bold text-[#00E676] tracking-widest uppercase mb-6">
          <Sparkles size={12} />
          About CricIntel
        </div>
        <h1 className="text-4xl md:text-5xl font-space font-black text-white mb-4 leading-tight">
          Intelligence for the<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-[#3B82F6]">Modern Game</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          CricIntel is an AI-powered cricket analytics platform that combines machine learning, 
          historical data analysis, and real-time conditions to deliver predictions that matter. 
          Built for analysts, cricket strategists, and passionate fans.
        </p>
      </motion.div>

      {/* What We Do */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-space font-bold text-white mb-2">What CricIntel Does</h2>
          <p className="text-sm text-gray-500">From squad prediction to venue analysis — powered by ML</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl bg-[#0A0A0C]/50 border border-white/[0.06] hover:border-[#00E676]/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 flex items-center justify-center text-[#00E676] mb-4 group-hover:bg-[#00E676] group-hover:text-black transition-colors">
                <f.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="relative">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-space font-bold text-white mb-2">How It Works</h2>
          <p className="text-sm text-gray-500">Three simple steps to your predicted XI</p>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            { step: '01', title: 'Configure the Match', desc: 'Select format (T20/ODI/Test), teams, venue, and gender. We auto-contextualize conditions.' },
            { step: '02', title: 'AI Analyzes 50+ Features', desc: 'Our ML engine evaluates recent form, H2H records, venue history, fitness, team balance, and weather.' },
            { step: '03', title: 'Get Your Predicted XI', desc: 'Receive the optimal Playing XI with batting order, impact scores, SHAP reasoning, and tactical insights.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex gap-5 items-start p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center">
                <span className="text-[#00E676] font-space font-black text-lg">{item.step}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-space font-bold text-white mb-2">Tech Stack</h2>
          <p className="text-sm text-gray-500">Built with modern, production-grade technologies</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <Code2 size={14} style={{ color: tech.color }} />
              <div>
                <p className="text-xs font-bold text-white">{tech.name}</p>
                <p className="text-[9px] text-gray-600">{tech.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="text-center">
        <h2 className="text-2xl font-space font-bold text-white mb-2">Built By</h2>
        <p className="text-sm text-gray-500 mb-8">Semester 4 Project</p>
        {team.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#0A0A0C]/50 border border-white/[0.06]"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00E676]/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-lg">
              {member.name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">{member.name}</p>
              <p className="text-[10px] text-gray-500">{member.role} • {member.specialty}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center py-8">
        <Link to="/app/prediction" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-black font-bold text-sm transition-colors shadow-[0_0_30px_rgba(0,230,118,0.3)]">
          Start Predicting <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default About
