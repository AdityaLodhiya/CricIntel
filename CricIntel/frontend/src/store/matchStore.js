import { create } from 'zustand'

export const useMatchStore = create((set) => ({
  format: 'T20',
  gender: 'Men',
  homeTeam: 'India',
  awayTeam: 'Australia',
  venue: 'Wankhede Stadium, Mumbai',
  
  setMatchDetails: (details) => set((state) => ({ ...state, ...details })),
  
  swapTeams: () => set((state) => ({
    homeTeam: state.awayTeam,
    awayTeam: state.homeTeam
  }))
}))
