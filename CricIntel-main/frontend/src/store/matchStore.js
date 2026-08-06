import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMatchStore = create(
  persist(
    (set) => ({
      format: 'T20',
      gender: 'Men',
      homeTeam: 'India',
      awayTeam: 'Australia',
      venue: 'Wankhede Stadium, Mumbai',
      predictionData: null,
      
      setMatchDetails: (details) => set((state) => ({ ...state, ...details })),
      
      swapTeams: () => set((state) => ({
        homeTeam: state.awayTeam,
        awayTeam: state.homeTeam
      }))
    }),
    {
      name: 'match-store', // key in localStorage
    }
  )
)
