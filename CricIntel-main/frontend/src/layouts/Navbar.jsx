import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, Search, User, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'

const Navbar = () => {
 const [isScrolled, setIsScrolled] = useState(false)
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
 const location = useLocation()
 const { isAuthenticated, user, logout } = useAuthStore()

 useEffect(() => {
 const handleScroll = () => setIsScrolled(window.scrollY > 20)
 window.addEventListener('scroll', handleScroll)
 return () => window.removeEventListener('scroll', handleScroll)
 }, [])

 const navLinks = [
 { name: 'Dashboard', path: '/app' },
 { name: 'Predict', path: '/app/prediction' },
 { name: 'Fixtures', path: '/app/fixtures' },
 ]

 return (
 <>
 <motion.nav
 initial={{ y: -100 }}
 animate={{ y: 0 }}
 className={cn(
 'fixed top-0 inset-x-0 z-50 transition-all duration-300',
 isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'
 )}
 >
 <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
 {/* Logo */}
 <Link to="/" className="flex items-center gap-2.5 group">
 <div className="relative w-8 h-8 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300">
 <span className="relative flex items-center justify-center h-full text-black font-black text-sm">C</span>
 </div>
 <span className="text-xl font-space font-bold tracking-tight text-white hidden sm:block">
 Cric<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">Intel</span>
 </span>
 </Link>

 {/* Desktop Nav */}
 {isAuthenticated && (
 <div className="hidden md:flex items-center gap-8">
 <div className="flex items-center gap-6 bg-surface/50 rounded-full px-6 py-2 border border-white/5">
 {navLinks.map((link) => {
 const isActive = location.pathname === link.path
 return (
 <Link
 key={link.name}
 to={link.path}
 className={cn(
 'relative text-sm font-medium transition-colors',
 isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
 )}
 >
 {link.name}
 {isActive && (
 <motion.div
 layoutId="nav-pill"
 className="absolute -bottom-2 inset-x-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"
 />
 )}
 </Link>
 )
 })}
 </div>
 </div>
 )}

 {/* Right Actions */}
 <div className="hidden md:flex items-center gap-4">
 {isAuthenticated ? (
 <>
 <button className="text-gray-400 hover:text-white transition-colors">
 <Search size={20} />
 </button>
 <button className="text-gray-400 hover:text-white transition-colors relative">
 <Bell size={20} />
 <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
 </button>
 <div className="w-px h-6 bg-white/10 mx-2"></div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <p className="text-sm font-medium text-white leading-none">{user?.first_name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}</p>
 <p className="text-xs text-muted mt-1">Cricket Analyst</p>
 </div>
 <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-primary cursor-pointer hover:border-primary transition-colors">
 <User size={18} />
 </div>
 <button onClick={logout} className="text-muted hover:text-danger ml-2">
 <LogOut size={18} />
 </button>
 </div>
 </>
 ) : (
 <div className="flex items-center gap-4">
 <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
 Login
 </Link>
 <Link to="/signup" className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-full hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all">
 Get Started
 </Link>
 </div>
 )}
 </div>

 {/* Mobile Toggle */}
 <button 
 className="md:hidden text-white"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 >
 {mobileMenuOpen ? <X /> : <Menu />}
 </button>
 </div>
 </motion.nav>

 {/* Mobile Drawer */}
 <AnimatePresence>
 {mobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="fixed inset-x-0 top-[60px] bg-background/95 backdrop-blur-xl border-b border-white/10 z-40 md:hidden overflow-hidden"
 >
 <div className="px-6 py-6 flex flex-col gap-4">
 {isAuthenticated ? (
 <>
 {navLinks.map((link) => (
 <Link
 key={link.name}
 to={link.path}
 onClick={() => setMobileMenuOpen(false)}
 className="text-lg font-medium text-gray-300 hover:text-primary transition-colors"
 >
 {link.name}
 </Link>
 ))}
 <div className="h-px bg-white/10 my-2"></div>
 <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-lg font-medium text-danger text-left">
 Logout
 </button>
 </>
 ) : (
 <>
 <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300">Login</Link>
 <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-primary">Get Started</Link>
 </>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}

export default Navbar
