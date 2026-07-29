import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Brain, MapPin, Users, BarChart3, Shield, ChevronRight } from 'lucide-react'
import GlowButton from '@/components/ui/GlowButton'

const StatCounter = ({ value, label }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="text-center">
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="text-4xl md:text-5xl font-space font-black text-white"
      >
        {value}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  )
}

const Landing = () => {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Playing XI",
      desc: "Our ML models analyze 50+ features including form, fitness, matchups, and conditions to predict the optimal Playing XI.",
      tag: "Core Engine"
    },
    {
      icon: TrendingUp,
      title: "Win Probability",
      desc: "Real-time match outcome forecasting calibrated on thousands of historical matches across T20, ODI, and Test formats.",
      tag: "Live"
    },
    {
      icon: Users,
      title: "Batter vs Bowler",
      desc: "Head-to-head matchup analysis with dismissal patterns, strike rates, and economy breakdowns by phase.",
      tag: "Matchups"
    },
    {
      icon: MapPin,
      title: "Venue Intelligence",
      desc: "Pitch behavior mapping, toss advantage data, average scores, and weather impact on team composition.",
      tag: "Conditions"
    },
    {
      icon: Shield,
      title: "Team Balance AI",
      desc: "Automatic suggestions for extra spinner or pacer based on venue, weather, and opponent weakness analysis.",
      tag: "Smart"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      desc: "Career stats, recent form trends, rolling averages, and SHAP-based feature importance for every prediction.",
      tag: "Data"
    }
  ]

  return (
    <div className="min-h-screen bg-[#050506] text-white overflow-hidden font-inter">
      
      {/* Premium Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-gradient-to-b from-[#050506] to-[#050506]/0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-16 bg-[#050506]/40 backdrop-blur-2xl border-b border-white/[0.04] pointer-events-auto shadow-[0_4px_30px_rgba(0,0,0,0.1)]"></div>
        <div className="max-w-[1200px] mx-auto h-16 px-6 flex items-center justify-between relative z-10 pointer-events-auto">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] transition-all duration-300">
              <span className="relative flex items-center justify-center h-full text-black font-black text-sm">C</span>
            </div>
            <span className="text-xl font-space font-bold tracking-tight">Cric<span className="text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]">Intel</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors font-medium">Features</a>
            <a href="#how" className="text-gray-400 hover:text-white transition-colors font-medium">How It Works</a>
            <a href="#coverage" className="text-gray-400 hover:text-white transition-colors font-medium">Coverage</a>
            <a href="#fixtures" className="text-gray-400 hover:text-white transition-colors font-medium">Fixtures</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link to="/signup">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00E676] to-[#00A355] rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                <div className="relative text-sm font-bold bg-black text-white px-5 py-2 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                  GET STARTED
                </div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Stadium Floodlights & Pitch Aesthetic Background */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0 overflow-hidden">
          {/* Top Floodlights */}
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"></div>
          <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"></div>
          
          {/* Pitch Green Glow */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00E676]/10 rounded-[100%] blur-[120px] shadow-[0_0_100px_rgba(0,230,118,0.2)]"></div>
          
          {/* Dot grid (Turf texture feel) */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, #00E676 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
        </motion.div>

        <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 text-xs font-bold text-[#00E676] tracking-wider uppercase mb-8">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              The Future of Cricket Analytics
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-[80px] font-space font-black tracking-tight leading-[1.1] mb-6">
              Outsmart the Pitch.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Predict the Match.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-[600px] mx-auto mb-10 leading-relaxed">
              Step onto the field with data. CricIntel uses machine learning to decode pitch conditions, player matchups, and optimal team balance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup">
                <GlowButton variant="primary" className="text-sm tracking-wider uppercase px-10 py-4 font-black shadow-[0_0_40px_rgba(0,230,118,0.3)] hover:shadow-[0_0_60px_rgba(0,230,118,0.5)] transition-shadow">
                  GET STARTED
                </GlowButton>
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-24 grid grid-cols-3 gap-8 max-w-[600px] mx-auto border-t border-white/[0.06] pt-12"
          >
            <StatCounter value="87%" label="Prediction Accuracy" />
            <StatCounter value="2.4K+" label="Players Analyzed" />
            <StatCounter value="12" label="Global Venues" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="max-w-[1100px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-primary mb-3 tracking-wider uppercase">The Playbook</p>
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">Everything you need to<br/>master the game</h2>
            <p className="text-gray-500 max-w-[500px] mx-auto">From player selection to win probability — built for analysts, fans, and cricket strategists.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl bg-[#09090B] border border-white/[0.06] hover:border-primary/30 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                    <f.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded">{f.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-24 bg-[#09090B] border-y border-white/[0.04]">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-primary mb-3 tracking-wider uppercase">The Toss</p>
            <h2 className="text-3xl md:text-4xl font-space font-bold">Three steps to your<br/>perfect Playing XI</h2>
          </div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Configure the Match", desc: "Select format (T20/ODI/Test), teams, venue, and match date. We auto-fetch live weather and pitch reports." },
              { step: "02", title: "AI Processes 50+ Features", desc: "Our ML engine evaluates player form, head-to-head records, venue stats, and team balance constraints (min 5 batters, 1 WK, 4 bowlers)." },
              { step: "03", title: "Get Your Predicted XI", desc: "Receive the optimal Playing XI with batting order, pace vs spin breakdown, and tactical reasoning for each selection." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 items-start bg-white/[0.02] p-6 rounded-2xl border border-white/[0.04]"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-space font-black text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Section (No Flags/Emojis, Pure Premium UI) */}
      <section id="coverage" className="py-24 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-primary mb-3 tracking-wider uppercase">Unparalleled Depth</p>
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">Complete Format Coverage</h2>
            <p className="text-gray-500 max-w-[600px] mx-auto">Advanced intelligence across every major cricket format. Precision modeling for the nuances of the game.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                format: 'T20', 
                desc: 'Hyper-aggressive strategies, strike-rate indexing, and death-overs analysis.', 
                color: 'from-[#00E676] to-emerald-500', 
                glow: 'group-hover:shadow-[0_0_40px_rgba(0,230,118,0.2)]'
              },
              { 
                format: 'ODI', 
                desc: 'Middle-phase accumulation models, partnership valuations, and pacing metrics.', 
                color: 'from-blue-500 to-cyan-500', 
                glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]'
              },
              { 
                format: 'TEST', 
                desc: 'Session-by-session win probability, pitch deterioration models, and endurance tracking.', 
                color: 'from-rose-500 to-red-500', 
                glow: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.2)]'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`group relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent overflow-hidden ${item.glow} transition-shadow duration-500`}
              >
                {/* Glowing moving border effect */}
                <div className={`absolute inset-[-100%] bg-gradient-to-r ${item.color} animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative h-full bg-[#0A0A0C] p-8 rounded-2xl z-10 flex flex-col justify-between overflow-hidden">
                  <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${item.color} blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  
                  <div className="mb-8">
                    <h3 className="text-4xl font-space font-black text-white italic tracking-wider opacity-90">{item.format}</h3>
                    <div className={`h-1 w-12 bg-gradient-to-r ${item.color} mt-4 rounded-full`}></div>
                  </div>
                  
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Fixtures Section (With Flags) */}
      <section id="fixtures" className="py-24 relative overflow-hidden bg-[#0A0A0C]/50 border-t border-white/[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-primary mb-3 tracking-wider uppercase">ICC & Bilateral</p>
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">Upcoming Fixtures</h2>
            <p className="text-gray-500 max-w-[600px] mx-auto">Simulate these high-stakes matches before the first ball is even bowled.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { match: 'IND vs AUS', team1: 'in', team2: 'au', format: 'WTC Final', date: 'Upcoming' },
              { match: 'ENG vs IND', team1: 'gb-eng', team2: 'in', format: 'Test Series', date: 'Upcoming' },
              { match: 'AUS vs ENG', team1: 'au', team2: 'gb-eng', format: 'Ashes', date: 'Upcoming' },
              { match: 'IND vs PAK', team1: 'in', team2: 'pk', format: 'Champions Trophy', date: 'Upcoming' },
              { match: 'SA vs AUS', team1: 'za', team2: 'au', format: 'ODI Series', date: 'Upcoming' },
              { match: 'NZ vs IND', team1: 'nz', team2: 'in', format: 'T20I Series', date: 'Upcoming' }
            ].map((fixture, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group relative w-full sm:w-[340px] bg-[#09090B] border border-white/[0.06] hover:border-primary/30 rounded-xl p-5 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,230,118,0.1)] hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-4 relative z-10 w-full">
                  <div className="flex items-center gap-2">
                    <img src={`https://flagcdn.com/w40/${fixture.team1}.png`} alt="Team 1" className="w-10 rounded shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/10" />
                    <span className="text-xs font-black text-gray-600 italic">VS</span>
                    <img src={`https://flagcdn.com/w40/${fixture.team2}.png`} alt="Team 2" className="w-10 rounded shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/10" />
                  </div>
                  
                  <div className="ml-auto text-right">
                    <h4 className="text-sm font-space font-black text-white italic tracking-wide">{fixture.match}</h4>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{fixture.format}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-[#00E676]/5 border-t border-[#00E676]/10">
        <div className="relative max-w-[600px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-space font-bold mb-4 text-white">Ready to dominate?</h2>
          <p className="text-gray-400 mb-8">Join the platform that is changing how cricket is analyzed.</p>
          <Link to="/signup" className="flex justify-center">
            <GlowButton variant="primary" className="text-sm tracking-wider uppercase px-12 py-4 font-black shadow-[0_0_30px_rgba(0,230,118,0.4)] hover:shadow-[0_0_50px_rgba(0,230,118,0.6)]">
              GET STARTED
            </GlowButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#030304] border-t border-white/[0.04]">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded flex items-center justify-center">
              <span className="relative flex items-center justify-center h-full text-black font-black text-[10px]">C</span>
            </div>
            <span className="text-sm font-space font-bold text-gray-500">CricIntel</span>
          </div>
          <p className="text-xs text-gray-600">© 2026 CricIntel. Intelligence for the modern game.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing

