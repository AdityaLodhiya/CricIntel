import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Auth/Login'
import Signup from '@/pages/Auth/Signup'
import VerifyOTP from '@/pages/Auth/VerifyOTP'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import Dashboard from '@/pages/Dashboard'
import Prediction from '@/pages/Prediction'
import PlayingXIReveal from '@/pages/Prediction/PlayingXIReveal'
import Fixtures from '@/pages/Fixtures'
import Matchups from '@/pages/Matchups'
import Venues from '@/pages/Venues'
import Analytics from '@/pages/Analytics'
import About from '@/pages/About'
import PlayerProfile from '@/pages/PlayerProfile'
import NotFound from '@/pages/NotFound'
import { useAuthStore } from '@/store/authStore'

// Protected Route — redirects to /login if NOT authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Public-Only Route — redirects to /app if ALREADY authenticated
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public-Only Routes */}
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="prediction/reveal" element={<PlayingXIReveal />} />
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="matchups" element={<Matchups />} />
          <Route path="venues" element={<Venues />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="about" element={<About />} />
          <Route path="player/:playerId" element={<PlayerProfile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
