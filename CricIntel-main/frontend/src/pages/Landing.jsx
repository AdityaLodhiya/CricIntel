import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Brain, MapPin, Users, BarChart3, Shield, Trophy, Zap, Cpu, Database, Activity, Menu, X, LayoutDashboard, Search, Github } from 'lucide-react'
import GlowButton from '@/components/ui/GlowButton'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import NeonBadge from '@/components/ui/NeonBadge'

const CricIntelLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
      <Brain size={18} className="text-white" />
    </div>
    <span className="font-space font-black text-xl tracking-tight text-white">
      Cric<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Intel</span>
    </span>
  </div>
)

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0B10]/80 backdrop-blur-xl border-b border-white/[0.05] py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="z-50 hover:opacity-80 transition-opacity">
          <CricIntelLogo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#why-cricintel" className="hover:text-white transition-colors">Why CricIntel</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link to="/signup">
            <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:opacity-90 font-bold text-sm text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:scale-105 active:scale-95">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden z-50 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-[#0A0B10] border-b border-white/10 shadow-2xl p-6 flex flex-col gap-4 md:hidden"
            >
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold p-2 hover:bg-white/5 rounded">Home</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold p-2 hover:bg-white/5 rounded">Features</a>
              <a href="#why-cricintel" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold p-2 hover:bg-white/5 rounded">Why CricIntel</a>
              <Link to="/login" className="text-white font-bold p-2 hover:bg-white/5 rounded">Login</Link>
              <Link to="/signup" className="mt-2 text-center py-3 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 font-bold text-white">Get Started</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

const Footer = () => (
  <footer className="border-t border-white/[0.05] bg-black text-gray-400 py-16 relative overflow-hidden">
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
    <div className="max-w-[1200px] mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <CricIntelLogo />
        <p className="mt-6 text-sm leading-relaxed max-w-sm">
          AI-Powered Cricket Intelligence & Match Prediction Platform. Elevate your analytical game with enterprise-grade machine learning and statistics.
        </p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Platform</h4>
        <ul className="space-y-3 text-sm">
          <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
          <li><Link to="/predictions" className="hover:text-blue-400 transition-colors">Playing XI Prediction</Link></li>
          <li><Link to="/matchup" className="hover:text-blue-400 transition-colors">Matchup Radar</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Company</h4>
        <ul className="space-y-3 text-sm">
          <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
          <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
          <li>
            <a href="https://github.com/AdityaLodhiya/CricIntel" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Github size={16} /> GitHub Source
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-[1200px] mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-sm flex flex-col md:flex-row items-center justify-between">
      <p>&copy; {new Date().getFullYear()} CricIntel. All rights reserved.</p>
      <div className="flex gap-4 mt-4 md:mt-0">
        <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </div>
  </footer>
)

const Landing = () => {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const features = [
    {
      icon: Brain,
      title: "AI Playing XI Prediction",
      desc: "Our ML models analyze huge arrays of features including form, fitness, matchups, and conditions to predict the optimal Playing XI.",
      tag: "Core Engine"
    },
    {
      icon: Users,
      title: "Matchup Radar",
      desc: "Deep head-to-head matchup analysis with dismissal patterns, strike rates, and economy breakdowns between batter and bowler.",
      tag: "Head-to-Head"
    },
    {
      icon: MapPin,
      title: "Venue Intelligence",
      desc: "Pitch behavior mapping, toss advantage data, average scores, and dynamic pacing metrics for total environment context.",
      tag: "Conditions"
    },
    {
      icon: BarChart3,
      title: "Historical Statistics",
      desc: "Extensive career stats, recent form trends, and historical performance breakdowns against opposing teams across all variants.",
      tag: "Data Pipeline"
    },
    {
      icon: LayoutDashboard,
      title: "Player Performance Analytics",
      desc: "Deep dive visually into individual performance splits. Analyze what factors power up a specific player's game plan.",
      tag: "Visualizations"
    },
    {
      icon: Search,
      title: "Real-time Insights",
      desc: "Generate predictions instantaneously without lagging backend loads, ensuring you get on-field intelligence immediately.",
      tag: "Performance"
    }
  ]
  
  const whyReasons = [
    { title: "AI Powered", icon: Cpu, desc: "Built with trained XGBoost classifiers for enterprise grade ML precision." },
    { title: "Production Dataset", icon: Database, desc: "Utilizes massive historical datasets completely avoiding synthetic dummy values." },
    { title: "Advanced Analytics", icon: Activity, desc: "Advanced mathematics generating accurate predictive charts natively via Plotly." },
    { title: "Fast Insights", icon: Zap, desc: "Zero-latency REST APIs designed exactly for large-scale inferencing speed." },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}></div>
        </motion.div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-sky-400 tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI-Powered Cricket Intelligence & Prediction Platform
            </div>

            <div className="flex flex-col items-center justify-center mb-6">
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 drop-shadow-2xl">
                <div className="relative flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                  <Brain className="text-white w-10 h-10 md:w-14 md:h-14" />
                </div>
                <h1 className="text-6xl sm:text-8xl md:text-[100px] font-space font-black tracking-tighter text-white">
                  Cric<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Intel</span>
                </h1>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-space font-bold tracking-tight text-white mb-2">
                Outsmart the Pitch. <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">Predict the Match.</span>
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Step onto the field with data. CricIntel uses machine learning and production-layer statistics to decode pitch conditions, player matchups, and optimal team balance before the toss.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup">
                <button className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 group">
                  Get Started For Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/login">
                <button className="flex items-center gap-3 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-white transition-all">
                  Login to Platform
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div>
              <AnimatedCounter value={87.4} suffix="%" decimals={1} className="text-4xl text-white block mb-1" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Accuracy</p>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-white/[0.06] py-6 sm:py-0">
              <AnimatedCounter value={2400} suffix="+" className="text-4xl text-white block mb-1" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Players Analyzed</p>
            </div>
            <div>
              <AnimatedCounter value={120} suffix="+" className="text-4xl text-white block mb-1" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Venues</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative bg-gradient-to-b from-black to-[#0A0B10]">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-sky-400 font-bold uppercase tracking-widest text-sm bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">The Playbook</span>
            <h2 className="text-4xl md:text-5xl font-space font-black mt-6">Everything you need to master the game</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-30 bg-blue-500 transition-opacity duration-500" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-sky-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <f.icon size={26} />
                  </div>
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">{f.tag}</span>
                </div>
                
                <h3 className="text-xl font-space font-bold text-white mb-3 relative z-10">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed relative z-10">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CricIntel */}
      <section id="why-cricintel" className="py-32 bg-[#0A0B10] relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
               <span className="text-sky-400 font-bold uppercase tracking-widest text-sm bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">Why CricIntel</span>
               <h2 className="text-4xl md:text-5xl font-space font-black mt-6 mb-6 leading-tight">
                Enterprise-grade architecture for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Unmatched Performance.</span>
               </h2>
               <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                 We've entirely eliminated dummy values and hardcoded placeholders. Our robust backend operates on XGBoost trained models securely integrated with expansive historical datasets.
               </p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {whyReasons.map((reason, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                         <reason.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{reason.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{reason.desc}</p>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
            
            {/* Visual Graphic Representation */}
            <div className="w-full lg:w-1/2 relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-blue-500/20 to-indigo-500/20 blur-[80px] rounded-full" />
               <div className="relative p-2 rounded-3xl bg-white/[0.05] border border-white/[0.1] shadow-2xl backdrop-blur-sm">
                  <div className="bg-[#0f111a] rounded-2xl overflow-hidden border border-white/5">
                     <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-3 h-3 rounded-full bg-sky-500/80" />
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="flex justify-between items-end mb-6">
                           <div>
                             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Win Probability Live</div>
                             <div className="text-3xl font-space font-black text-white">62.8%</div>
                           </div>
                           <div className="text-right">
                             <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">+14% Shift</div>
                             <div className="h-8 w-24 bg-gradient-to-r from-sky-400/20 to-blue-500/30 rounded-lg flex items-center px-2 border border-sky-400/30">
                               <TrendingUp size={16} className="text-sky-400" />
                             </div>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                             <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 w-[62.8%]" />
                           </div>
                           <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                             <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[37.2%]" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative text-center overflow-hidden border-t border-white/5 bg-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-[800px] mx-auto px-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Trophy size={36} className="text-sky-400" />
          </div>
          <h2 className="text-4xl md:text-[56px] font-space font-black mb-6 leading-tight">Ready to Predict Like a Professional?</h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join the platform that is changing how cricket is analyzed. Access state-of-the-art models and predict outcomes with precision.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <button className="w-full sm:w-auto px-12 py-4 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all hover:scale-105 active:scale-95 text-lg">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="w-full sm:w-auto px-12 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-white transition-all text-lg">
                Login
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default Landing
