import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col font-inter">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        {/* Background Ambient Glows */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
