import React from 'react'
import { Info, Database, Cpu, Trophy, Target, Shield, Activity, Globe } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { motion } from 'framer-motion'

const About = () => {
 const features = [
 { icon: Database, title: "Massive Datasets", desc: "Trained on thousands of historical matches spanning Test, ODI, and T20s." },
 { icon: Cpu, title: "XGBoost Engine", desc: "Advanced tree-based models predicting match outcomes with extreme precision." },
 { icon: Target, title: "SHAP Explainability", desc: "Understand exactly why a player was selected using feature importance metrics." },
 { icon: Trophy, title: "Winning Insights", desc: "Identify key matchups and venue biases before the coin toss." },
 { icon: Activity, title: "Live Analytics", desc: "Real-time win probability updates mimicking broadcast graphics." },
 { icon: Globe, title: "Global Coverage", desc: "Comprehensive databases covering Men's and Women's international circuits." },
 ]

 return (
 <div className="pb-20 font-inter">
 <PageHeader 
 title="About CricIntel"
 description="The vision behind the next-generation cricket analytics platform."
 icon={Info}
 breadcrumbs={[
 { label: 'About' }
 ]}
 />

 <div className="space-y-8 max-w-5xl mx-auto">
 <GlassCard className="p-8 border-l-4 border-l-primary relative overflow-hidden group shadow-[0_0_40px_rgba(59,130,246,0.05)]">
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700"></div>
 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
 <h2 className="text-3xl font-space font-black text-white mb-6 tracking-tight flex items-center gap-3">
    <Shield className="text-primary" size={28} />
    Our Mission
 </h2>
 <p className="text-gray-300 leading-relaxed text-lg mb-4">
 To provide broadcast-quality cricket analytics and machine learning insights to fans, analysts, and teams globally. We believe that data shouldn't just be numbers on a spreadsheet; it should tell the story of the game.
 </p>
 <p className="text-gray-300 leading-relaxed text-lg">
 CricIntel bridges the gap between raw statistical data and actionable intelligence, empowering decision-makers with the same tools used by professional franchise analysts and major broadcasters like JioCinema and Star Sports.
 </p>
 </GlassCard>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {features.map((feature, idx) => (
 <motion.div 
 key={idx}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 >
 <GlassCard className="p-6 h-full hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl">
 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
 <feature.icon className="text-primary relative z-10" size={24} />
 </div>
 <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
 <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
 </GlassCard>
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 )
}

export default About
