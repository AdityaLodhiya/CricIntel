import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 LayoutDashboard, Zap, MapPin, Users, BarChart3, 
 Calendar, LogOut, Menu, X, ChevronDown, Bell,
 User, Info, Swords, MessageSquare
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navItems = [
 { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
 { to: '/app/prediction', label: 'Predict XI', icon: Zap },
 { to: '/app/dynamic-matchups', label: 'Dynamic Matchups', icon: Swords },
 { to: '/app/matchups', label: 'Matchups', icon: Users },
 { to: '/app/venues', label: 'Venues', icon: MapPin },
 { to: '/app/fixtures', label: 'Fixtures', icon: Calendar },
 { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
 { to: '/app/feedback', label: 'Feedback', icon: MessageSquare },
 { to: '/app/about', label: 'About', icon: Info },
]

const Navbar = () => {
 const { user, logout, isAuthenticated } = useAuthStore()
 const navigate = useNavigate()
 const [mobileOpen, setMobileOpen] = useState(false)
 const [profileOpen, setProfileOpen] = useState(false)

 const handleLogout = () => {
 logout()
 navigate('/login')
 }

 return (
 <>
 <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-[#030305]/80 backdrop-blur-3xl border-b border-white/[0.04] shadow-glass transition-all duration-300">
 <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
 
 {/* Logo */}
 <Link to={isAuthenticated ? '/app' : '/'} className="flex items-center gap-2.5 shrink-0 group">
 <div className="relative w-8 h-8 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:transition-all duration-300">
 <span className="relative flex items-center justify-center h-full text-white font-black text-sm">C</span>
 </div>
 <span className="text-lg font-space font-bold tracking-tight text-white hidden sm:block">
 Cric<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">Intel</span>
 </span>
 </Link>

 {/* Desktop Nav Links */}
 {isAuthenticated && (
 <div className="hidden lg:flex items-center ml-8 gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.04]">
 {navItems.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 className={({ isActive }) => cn(
 "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 overflow-hidden group",
 isActive ? "text-white" : "text-gray-400 hover:text-white"
 )}
 >
 {({ isActive }) => (
 <>
 {isActive && (
 <motion.div
 layoutId="activeNavIndicator"
 className="absolute inset-0 bg-white/[0.06] rounded-lg"
 transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
 />
 )}
 <item.icon size={16} className={cn("relative z-10 transition-colors", isActive ? "text-primary" : "group-hover:text-gray-300")} />
 <span className="relative z-10">{item.label}</span>
 </>
 )}
 </NavLink>
 ))}
 </div>
 )}

 {/* Right Side */}
 <div className="flex items-center gap-4">
 {isAuthenticated ? (
 <>
 

 {/* Profile Dropdown */}
 <div className="relative">
 <button 
 onClick={() => setProfileOpen(!profileOpen)}
 className="flex items-center gap-3 pl-2 pr-3 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.05] transition-all"
 >
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
 <User size={16} className="text-primary" />
 </div>
 <div className="hidden sm:block text-left">
 <p className="text-xs font-bold text-white max-w-[100px] truncate leading-tight">
 {user?.first_name || user?.email?.split('@')[0] || 'User'}
 </p>
 <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Analyst</p>
 </div>
 <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-300 ml-1", profileOpen && "rotate-180")} />
 </button>

 <AnimatePresence>
 {profileOpen && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="absolute right-0 top-full mt-3 w-64 bg-[#0A0B10]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-glass-lg overflow-hidden z-50"
 >
 <div className="p-4 border-b border-white/[0.04] bg-white/[0.02]">
 <p className="text-sm font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
 <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
 </div>
 <div className="p-2 space-y-1">
 <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all">
 <User size={16} /> Profile Settings
 </button>
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
 >
 <LogOut size={16} /> Sign Out
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 {/* Mobile Menu Toggle */}
 <button 
 onClick={() => setMobileOpen(!mobileOpen)}
 className="lg:hidden p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
 >
 {mobileOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 </>
 ) : (
 <div className="flex items-center gap-4">
 <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
 Sign In
 </Link>
 <Link 
 to="/signup" 
 className="text-sm font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:opacity-90 text-white px-5 py-2 rounded-xl transition-all"
 >
 Get Started
 </Link>
 </div>
 )}
 </div>
 </div>
 </nav>

 {/* Mobile Menu */}
 <AnimatePresence>
 {mobileOpen && isAuthenticated && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="lg:hidden fixed top-16 inset-x-0 bg-[#0A0B10]/95 backdrop-blur-3xl border-b border-white/[0.04] z-40 overflow-hidden shadow-glass-lg"
 >
 <div className="p-4 space-y-1">
 {navItems.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 onClick={() => setMobileOpen(false)}
 className={({ isActive }) => cn(
 "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
 isActive 
 ? "bg-primary/10 text-primary" 
 : "text-gray-300 hover:text-white hover:bg-white/[0.05]"
 )}
 >
 <item.icon size={18} />
 {item.label}
 </NavLink>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}

export default Navbar
