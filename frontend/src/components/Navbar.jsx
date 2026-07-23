import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Zap, MapPin, Users, BarChart3, 
  Calendar, LogOut, Menu, X, ChevronDown, Bell,
  User, Info
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/prediction', label: 'Predict XI', icon: Zap },
  { to: '/app/matchups', label: 'Matchups', icon: Users },
  { to: '/app/venues', label: 'Venues', icon: MapPin },
  { to: '/app/fixtures', label: 'Fixtures', icon: Calendar },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
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
    <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-[#050506]/40 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to={isAuthenticated ? '/app' : '/'} className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-8 h-8 bg-gradient-to-br from-[#00E676] to-[#00A355] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] transition-all duration-300">
            <span className="relative flex items-center justify-center h-full text-black font-black text-sm">C</span>
          </div>
          <span className="text-lg font-space font-bold tracking-tight text-white hidden sm:block">
            Cric<span className="text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]">Intel</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-1 ml-10">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/30 border border-white/10 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block max-w-[100px] truncate">
                    {user?.first_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", profileOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#18181B] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="text-sm font-semibold bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0A0A0C] border-b border-white/5 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
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
    </nav>
  )
}

export default Navbar
