import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '../../store/matchStore'
import { X, Info, Zap, Target, TrendingUp, MapPin, ChevronRight, Trophy, Activity } from 'lucide-react'

// ─────────────────────────────────────────────
// Role Colors
// ─────────────────────────────────────────────
const ROLE_COLORS = {
  'Batter':        { bg: 'from-blue-500/25 to-blue-600/5', border: 'border-blue-500/30', accent: '#3B82F6', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30', glow: 'shadow-blue-500/5' },
  'WK-Batter':     { bg: 'from-orange-500/25 to-orange-600/5', border: 'border-orange-500/30', accent: '#F97316', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', glow: 'shadow-orange-500/5' },
  'All-Rounder':   { bg: 'from-purple-500/25 to-purple-600/5', border: 'border-purple-500/30', accent: '#8B5CF6', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30', glow: 'shadow-purple-500/5' },
  'Bowler (Pace)':  { bg: 'from-red-500/25 to-red-600/5', border: 'border-red-500/30', accent: '#EF4444', badge: 'bg-red-500/15 text-red-400 border-red-500/30', glow: 'shadow-red-500/5' },
  'Bowler (Spin)':  { bg: 'from-amber-500/25 to-amber-600/5', border: 'border-amber-500/30', accent: '#F59E0B', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', glow: 'shadow-amber-500/5' },
}

const getFlag = (team) => ({ India: 'in', Australia: 'au', England: 'gb-eng', 'South Africa': 'za', 'New Zealand': 'nz' })[team] || 'in'

// ─────────────────────────────────────────────
// FORMAT-SPECIFIC SQUADS (Test ≠ ODI ≠ T20)
// Based on ESPN Cricinfo player profiles
// ─────────────────────────────────────────────
export const SQUADS = {
  Men: {
    India: {
      T20: {
        xi: [
          { name: 'Yashasvi Jaiswal', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 88, reason: 'Explosive opener; SR 160+ in T20Is, powerplay dominator' },
          { name: 'Suryakumar Yadav', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 93, reason: '#1 T20I ranking; 360° shot-maker, 4 T20I hundreds', isCaptain: true },
          { name: 'Tilak Varma', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 82, reason: 'Middle-order anchor; avg 45+ in T20Is, excellent vs spin' },
          { name: 'Rishabh Pant', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 85, reason: 'Match-winner WK; explosive in PP, avg 30+ in T20Is', isWK: true },
          { name: 'Hardik Pandya', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 87, reason: 'Pace AR; finisher + death overs, SR 145 in T20Is' },
          { name: 'Rinku Singh', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 79, reason: 'Finisher; 5 sixes in last over fame, clutch player' },
          { name: 'Axar Patel', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 80, reason: 'Spin AR; econ 6.8 in T20Is, useful lower-order bat' },
          { name: 'Kuldeep Yadav', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Wrist Spin', impactScore: 84, reason: 'Wrist spinner; googly threat, 75+ T20I wickets' },
          { name: 'Jasprit Bumrah', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 95, reason: 'World #1 T20I bowler; death yorkers, econ 6.2' },
          { name: 'Arshdeep Singh', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 83, reason: 'Left-arm death specialist; 85+ T20I wickets' },
          { name: 'Mohammed Siraj', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 78, reason: 'Swing bowler; good with new ball, powerplay threat' },
        ],
        bench: [
          { name: 'Sanju Samson', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 76, reason: 'Alternative keeper; clean hitter', isWK: true },
          { name: 'Washington Sundar', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 82, reason: 'Powerplay specialist; economical spin' },
          { name: 'Yuzvendra Chahal', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 77, reason: 'Leg spinner; highest T20I wickets for India' },
        ]
      },
      ODI: {
        xi: [
          { name: 'Rohit Sharma', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 90, reason: 'Captain; 10000+ ODI runs, 3 double hundreds in ODIs', isCaptain: true },
          { name: 'Shubman Gill', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 85, reason: 'Elegant opener; avg 58 in ODIs, 5 hundreds' },
          { name: 'Virat Kohli', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Medium', impactScore: 94, reason: 'GOAT chaser; 50 ODI hundreds, avg 58 in ODIs' },
          { name: 'Shreyas Iyer', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 80, reason: 'Middle-order; avg 48 in ODIs, strong vs pace' },
          { name: 'KL Rahul', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 82, reason: 'Keeper-batter; avg 45 in ODIs, anchors innings', isWK: true },
          { name: 'Hardik Pandya', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 86, reason: 'Pace AR; 5th bowler option, lower-order hitting' },
          { name: 'Ravindra Jadeja', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 89, reason: 'Best fielder; econ 4.9 in ODIs, avg 32 with bat' },
          { name: 'Kuldeep Yadav', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Wrist Spin', impactScore: 85, reason: 'Wrist spinner; 5-fers in ODIs, middle-overs maestro' },
          { name: 'Jasprit Bumrah', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 95, reason: 'World #1; econ 4.5 in ODIs, death overs king' },
          { name: 'Mohammed Shami', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 87, reason: '2023 WC top wicket-taker; 7/57 vs NZ in SF' },
          { name: 'Mohammed Siraj', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 81, reason: 'Swing bowler; new ball threat, econ 5.2' },
        ],
        bench: [
          { name: 'Suryakumar Yadav', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: '360° hitter; impact sub option' },
          { name: 'Washington Sundar', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 74, reason: 'PP specialist off-spinner' },
          { name: 'Arshdeep Singh', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 77, reason: 'Left-arm option' },
        ]
      },
      Test: {
        xi: [
          { name: 'Yashasvi Jaiswal', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 89, reason: 'Opener; double hundred vs ENG, avg 56 in Tests' },
          { name: 'Rohit Sharma', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 86, reason: 'Captain; Test opener, avg 42 in Tests', isCaptain: true },
          { name: 'Shubman Gill', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 82, reason: 'No. 3; avg 45 in Tests, elegant cover drives' },
          { name: 'Virat Kohli', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Medium', impactScore: 90, reason: '29 Test hundreds; avg 48, chase specialist' },
          { name: 'Cheteshwar Pujara', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Defensive wall; avg 44 in Tests, occupies crease' },
          { name: 'Rishabh Pant', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 87, reason: 'Attacking WK; Gabba hero, avg 35 in Tests', isWK: true },
          { name: 'Ravindra Jadeja', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 91, reason: 'Best Test AR in world; 300+ wickets, avg 36 bat' },
          { name: 'R Ashwin', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 92, reason: '530+ Test wickets; carrom ball, tactical genius' },
          { name: 'Jasprit Bumrah', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 96, reason: 'World #1 Test bowler; avg 20, lethal yorkers' },
          { name: 'Mohammed Shami', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 85, reason: 'Seam wizard; 230+ Test wickets, reverse swing' },
          { name: 'Mohammed Siraj', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Aggression; 75+ Test wickets, Gabba debut hero' },
        ],
        bench: [
          { name: 'KL Rahul', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 76, reason: 'Backup opener/middle-order' },
          { name: 'Axar Patel', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 79, reason: 'Home Test specialist' },
          { name: 'Umesh Yadav', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 72, reason: 'Experienced backup pacer' },
        ]
      }
    },
    Australia: {
      T20: {
        xi: [
          { name: 'Travis Head', role: 'Batter', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 89, reason: 'Explosive opener; ICC event match-winner, 150+ SR' },
          { name: 'Jake Fraser-McGurk', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 82, reason: 'Explosive opener; IPL breakout' },
          { name: 'Glenn Maxwell', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 90, reason: 'Big Show; 360° hitting + useful off-spin' },
          { name: 'Mitchell Marsh', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 85, reason: 'Captain; T20 WC winner 2024, finisher', isCaptain: true },
          { name: 'Tim David', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 80, reason: 'Power finisher; SR 160+ in T20s globally' },
          { name: 'Josh Inglis', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Explosive keeper; 65(30) type innings', isWK: true },
          { name: 'Marcus Stoinis', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 79, reason: 'Power-hitting AR; T20 WC semifinal hero' },
          { name: 'Adam Zampa', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 85, reason: 'Leg spinner; 100+ T20I wickets, middle-overs control' },
          { name: 'Pat Cummins', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 84, reason: 'Aggression; bounce at 145kmph, death overs' },
          { name: 'Mitchell Starc', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Left-Arm Fast', impactScore: 88, reason: 'Express left-arm; 150kmph+ yorkers, WC record' },
          { name: 'Josh Hazlewood', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Metronomic; econ 7.1 in T20Is, new ball expert' },
        ],
        bench: [
          { name: 'Cameron Green', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 77, reason: 'Pace AR; 140kmph+ and clean hitter' },
          { name: 'Nathan Ellis', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 74, reason: 'Death overs specialist' },
          { name: 'Spencer Johnson', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Left-Arm Fast', impactScore: 75, reason: 'Left-arm express pace' },
        ]
      },
      ODI: {
        xi: [
          { name: 'Travis Head', role: 'Batter', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 90, reason: '2023 WC final century; avg 45 in ODIs' },
          { name: 'Jake Fraser-McGurk', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 84, reason: 'Aggressive top order' },
          { name: 'Steve Smith', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 88, reason: 'Modern great; avg 42 in ODIs, anchor' },
          { name: 'Marnus Labuschagne', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 83, reason: 'Run machine; avg 45+ in ODIs, smart rotation' },
          { name: 'Glenn Maxwell', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 89, reason: '201* vs AFG; match-winner + spin option' },
          { name: 'Alex Carey', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 78, reason: 'Reliable keeper; avg 30+ in ODIs', isWK: true },
          { name: 'Mitchell Marsh', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: '5th bowler; medium pace + middle-order', isCaptain: true },
          { name: 'Adam Zampa', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 86, reason: 'Leg spinner; 130+ ODI wickets' },
          { name: 'Pat Cummins', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 91, reason: 'Spearhead; avg 23 in ODIs, hat-trick vs SA' },
          { name: 'Mitchell Starc', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Left-Arm Fast', impactScore: 90, reason: 'Highest WC wicket-taker; death yorkers' },
          { name: 'Josh Hazlewood', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 85, reason: 'Best economy in ODIs; 4.8 econ' },
        ],
        bench: [
          { name: 'Cameron Green', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 79, reason: 'Pace AR backup' },
          { name: 'Marcus Stoinis', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 76, reason: 'Finisher' },
          { name: 'Nathan Lyon', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 74, reason: 'Second spin option' },
        ]
      },
      Test: {
        xi: [
          { name: 'Usman Khawaja', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 84, reason: 'Opener; avg 47 in Tests, patient technique' },
          { name: 'Steve Smith', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 93, reason: 'Modern great; avg 60 in Tests, 32 hundreds' },
          { name: 'Marnus Labuschagne', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 87, reason: 'Consistent; avg 52 in Tests, great vs pace' },
          { name: 'Travis Head', role: 'Batter', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 88, reason: 'Counterattacker; avg 45 in Tests, big match player' },
          { name: 'Mitchell Marsh', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 80, reason: 'Test AR; batting avg 32 + seam bowling', isCaptain: true },
          { name: 'Alex Carey', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 79, reason: 'Test keeper; Ashes stumping hero', isWK: true },
          { name: 'Cameron Green', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 83, reason: 'Genuine pace AR; 140kmph + Test hundreds' },
          { name: 'Nathan Lyon', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 90, reason: 'GOAT; 530+ Test wickets, drift and bounce' },
          { name: 'Pat Cummins', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 94, reason: 'Captain; avg 21 in Tests, bounce at 140+' },
          { name: 'Mitchell Starc', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Left-Arm Fast', impactScore: 88, reason: 'Express; 350+ Test wickets, reverse swing' },
          { name: 'Josh Hazlewood', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 86, reason: 'Line & length king; avg 25 in Tests' },
        ],
        bench: [
          { name: 'Marcus Harris', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 70, reason: 'Backup opener' },
          { name: 'Todd Murphy', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 72, reason: 'Young off-spinner' },
          { name: 'Scott Boland', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 78, reason: 'MCG king; avg 15 debut spell' },
        ]
      }
    },
    England: {
      T20: {
        xi: [
          { name: 'Phil Salt', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 88, reason: 'Explosive opener; SR 165 in T20Is, clean hitter', isWK: true },
          { name: 'Jos Buttler', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 90, reason: 'Captain; 360° skills, IPL franchise icon', isCaptain: true },
          { name: 'Harry Brook', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 84, reason: 'Aggressive; SR 140+ in T20Is, power zones' },
          { name: 'Liam Livingstone', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 82, reason: 'Big hitter + leg-spin; both hands batting' },
          { name: 'Moeen Ali', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 79, reason: 'PP hitter + off-spin; experienced' },
          { name: 'Ben Stokes', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 87, reason: 'Match-winner; WC super-over hero' },
          { name: 'Sam Curran', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 83, reason: 'IPL MVP; left-arm seam + death batting' },
          { name: 'Adil Rashid', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 84, reason: 'Leg spinner; 100+ T20I wickets, googly expert' },
          { name: 'Jofra Archer', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 86, reason: 'Express; 150kmph+, WC super-over hero' },
          { name: 'Mark Wood', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 83, reason: 'Speed demon; 155kmph, hits the deck hard' },
          { name: 'Reece Topley', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 78, reason: 'Left-arm seamer; T20 death specialist' },
        ],
        bench: [
          { name: 'Jonny Bairstow', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 76, reason: 'Power-hitter backup' },
          { name: 'Chris Jordan', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 74, reason: 'Death bowling veteran' },
          { name: 'Rehan Ahmed', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 72, reason: 'Young leg-spin option' },
        ]
      },
      ODI: {
        xi: [
          { name: 'Jonny Bairstow', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 82, reason: 'Aggressive opener; 2019 WC semi-final hero' },
          { name: 'Joe Root', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 91, reason: 'Run machine; avg 50+ in ODIs, anchor' },
          { name: 'Ben Stokes', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 92, reason: 'Legend; 2019 WC final hero, greatest all-rounder', isCaptain: true },
          { name: 'Harry Brook', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 84, reason: 'Future star; aggressive middle-order' },
          { name: 'Jos Buttler', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 88, reason: 'WK; avg 40 in ODIs, power finisher', isWK: true },
          { name: 'Liam Livingstone', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 80, reason: 'Power-hitter; off-spin + leg-spin dual option' },
          { name: 'Moeen Ali', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 78, reason: 'Spin AR; handy middle-order bat' },
          { name: 'Adil Rashid', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 85, reason: 'Leg spinner; 200+ intl wickets' },
          { name: 'Chris Woakes', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 84, reason: 'Swing king; avg 29 in ODIs, useful bat' },
          { name: 'Mark Wood', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 82, reason: 'Speed; 155kmph, WC 2019 hero' },
          { name: 'Jofra Archer', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 85, reason: 'WC super-over bowler; express pace' },
        ],
        bench: [
          { name: 'Dawid Malan', role: 'Batter', batHand: 'LHB', bowlStyle: 'Leg Break', impactScore: 74, reason: 'Backup batter' },
          { name: 'Sam Curran', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 78, reason: 'Left-arm seam option' },
          { name: 'Rehan Ahmed', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 73, reason: 'Young leg-spin backup' },
        ]
      },
      Test: {
        xi: [
          { name: 'Zak Crawley', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Bazball opener; aggressive stroke play' },
          { name: 'Ben Duckett', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 82, reason: 'LHB opener; reverse sweep, avg 40 in Tests' },
          { name: 'Joe Root', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 95, reason: 'Greatest; 12000+ Test runs, 34 hundreds' },
          { name: 'Harry Brook', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 87, reason: 'Prodigy; avg 55 in Tests, counter-attacker' },
          { name: 'Ben Stokes', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 93, reason: 'Captain; Headingley 135*, greatest AR', isCaptain: true },
          { name: 'Jonny Bairstow', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 80, reason: 'WK; aggressive in Bazball era, Test hundreds', isWK: true },
          { name: 'Moeen Ali', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 77, reason: 'Off-spin AR; Ashes performer' },
          { name: 'Jack Leach', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 76, reason: 'Left-arm orthodox; patient, 100+ Test wickets' },
          { name: 'James Anderson', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 90, reason: 'Legend; 700 Test wickets, swing master' },
          { name: 'Stuart Broad', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 88, reason: 'Ashes legend; 600+ Test wickets' },
          { name: 'Mark Wood', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 84, reason: 'Express; 155kmph, bounce weapon in Tests' },
        ],
        bench: [
          { name: 'Ollie Pope', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Middle-order backup; Test hundreds' },
          { name: 'Chris Woakes', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Home king; avg 22 at home' },
          { name: 'Shoaib Bashir', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 72, reason: 'Young off-spinner' },
        ]
      }
    }
  },
  Women: {
    India: {
      T20: {
        xi: [
          { name: 'Smriti Mandhana', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 91, reason: 'Elegant opener; T20I avg 25, SR 125, 100+ matches' },
          { name: 'Shafali Verma', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 84, reason: 'Aggressive opener; youngest T20I debutant, explosive' },
          { name: 'Jemimah Rodrigues', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 80, reason: 'Stylish; strong vs spin, The Hundred star' },
          { name: 'Harmanpreet Kaur', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 90, reason: 'Captain; 171* in WC, fearless leader', isCaptain: true },
          { name: 'Richa Ghosh', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 83, reason: 'Power-hitter WK; SR 130+ in T20Is', isWK: true },
          { name: 'Deepti Sharma', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 85, reason: 'All-round; 100+ T20I wickets + 1500 runs' },
          { name: 'Pooja Vastrakar', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 81, reason: 'Pace AR; genuine speed + lower-order hits' },
          { name: 'Radha Yadav', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 79, reason: 'Left-arm spinner; econ 6.0 in T20Is' },
          { name: 'Renuka Singh', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 84, reason: 'Leading pacer; swing + seam, 4/18 vs AUS' },
          { name: 'Shreyanka Patil', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 76, reason: 'Young off-spinner; WPL breakout star' },
          { name: 'Titas Sadhu', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 73, reason: 'Young pacer; U19 WC star, accurate' },
        ],
        bench: [
          { name: 'Yastika Bhatia', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 74, reason: 'Backup keeper-batter', isWK: true },
          { name: 'Sneh Rana', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 75, reason: 'Off-spin AR; Test savior' },
          { name: 'Shikha Pandey', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 70, reason: 'Experienced seamer' },
        ]
      },
      ODI: {
        xi: [
          { name: 'Smriti Mandhana', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 92, reason: 'World-class; avg 42 in ODIs, elegant drives' },
          { name: 'Shafali Verma', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 82, reason: 'Aggressive opener; growing ODI maturity' },
          { name: 'Harmanpreet Kaur', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 91, reason: 'Captain; 171* WC SF, avg 35 in ODIs', isCaptain: true },
          { name: 'Jemimah Rodrigues', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 80, reason: 'Middle-order; avg 30+ in ODIs' },
          { name: 'Yastika Bhatia', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 78, reason: 'ODI WK; reliable, avg 28', isWK: true },
          { name: 'Deepti Sharma', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 87, reason: 'All-round queen; 100+ ODI wickets + 2500 runs' },
          { name: 'Pooja Vastrakar', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Pace AR; WC performer' },
          { name: 'Sneh Rana', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 77, reason: 'Off-spinner; Test 80* comeback hero' },
          { name: 'Renuka Singh', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 85, reason: 'Top pacer; swing expert, CWG medal winner' },
          { name: 'Rajeshwari Gayakwad', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 76, reason: 'Left-arm spinner; 50+ ODI wickets' },
          { name: 'Shikha Pandey', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 74, reason: 'Experienced; 60+ ODI wickets, steady' },
        ],
        bench: [
          { name: 'Richa Ghosh', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Power-hitting WK option', isWK: true },
          { name: 'Harleen Deol', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 72, reason: 'Athletic fielder; backup bat' },
          { name: 'Radha Yadav', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 73, reason: 'Left-arm spin backup' },
        ]
      },
      Test: {
        xi: [
          { name: 'Smriti Mandhana', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 90, reason: 'Test opener; elegant, century in Aus' },
          { name: 'Shafali Verma', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 83, reason: 'Test debut hero; youngest debutant century' },
          { name: 'Punam Raut', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 75, reason: 'Test specialist; patient technique' },
          { name: 'Harmanpreet Kaur', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 88, reason: 'Captain; Test match temperament', isCaptain: true },
          { name: 'Jemimah Rodrigues', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Middle-order; composed technique' },
          { name: 'Yastika Bhatia', role: 'WK-Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 77, reason: 'Test WK; reliable keeper', isWK: true },
          { name: 'Deepti Sharma', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 86, reason: 'Test AR; vital with bat and ball' },
          { name: 'Sneh Rana', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 80, reason: 'Test hero; 80* + 4 wkts to save match' },
          { name: 'Renuka Singh', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Lead pacer; Test swing threat' },
          { name: 'Rajeshwari Gayakwad', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 78, reason: 'Left-arm spinner; Test match patience' },
          { name: 'Pooja Vastrakar', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 79, reason: 'Pace AR; Test seam bowling' },
        ],
        bench: [
          { name: 'Richa Ghosh', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 74, reason: 'Attacking backup WK', isWK: true },
          { name: 'Radha Yadav', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 72, reason: 'Left-arm spin backup' },
          { name: 'Shreyanka Patil', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Right-Arm Off Break', impactScore: 70, reason: 'Young spinner' },
        ]
      }
    },
    Australia: {
      T20: {
        xi: [
          { name: 'Alyssa Healy', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 91, reason: 'Captain WK; WC 170, SR 130+', isCaptain: true, isWK: true },
          { name: 'Beth Mooney', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 89, reason: '#1 T20I batter; avg 45+ in T20Is' },
          { name: 'Phoebe Litchfield', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 93, reason: 'Rising LHB star' },
          { name: 'Ellyse Perry', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 94, reason: 'Greatest AR; dual intl in cricket & football' },
          { name: 'Tahlia McGrath', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 85, reason: 'VC; bat + medium pace, smart cricketer' },
          { name: 'Ashleigh Gardner', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 86, reason: 'Match-winner; off-spin + big hits' },
          { name: 'Grace Harris', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 78, reason: 'Big hitter; power at death' },
          { name: 'Jess Jonassen', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 81, reason: 'Left-arm; 100+ T20I wickets' },
          { name: 'Megan Schutt', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 87, reason: 'Lead pacer; swing expert' },
          { name: 'Darcie Brown', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 82, reason: 'Express; 120kmph+, bouncer threat' },
          { name: 'Alana King', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 79, reason: 'Leg spinner; Ashes debut hero' },
        ],
        bench: [
          { name: 'Annabel Sutherland', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 76, reason: 'Pace AR backup' },
          { name: 'Georgia Wareham', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 74, reason: 'Leg-spin backup' },
          { name: 'Kim Garth', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 72, reason: 'Seam backup' },
        ]
      },
      ODI: {
        xi: [
          { name: 'Alyssa Healy', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 90, reason: 'Captain WK; aggressive opener', isCaptain: true, isWK: true },
          { name: 'Beth Mooney', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 88, reason: 'ODI run machine; avg 50+ in ODIs' },
          { name: 'Phoebe Litchfield', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 94, reason: 'Future of Aussie batting' },
          { name: 'Ellyse Perry', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 95, reason: 'GOAT AR; avg 50 bat + 24 ball in ODIs' },
          { name: 'Tahlia McGrath', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 84, reason: 'VC; consistent all-round performer' },
          { name: 'Ashleigh Gardner', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 85, reason: 'Off-spin AR; big hitting + wickets' },
          { name: 'Annabel Sutherland', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 81, reason: 'Pace AR; genuine quick + Test double ton' },
          { name: 'Jess Jonassen', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 82, reason: 'Left-arm; 150+ intl wickets' },
          { name: 'Megan Schutt', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 88, reason: 'Lead pacer; 100+ ODI wickets' },
          { name: 'Darcie Brown', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 80, reason: 'Pace weapon; genuine fast bowler' },
          { name: 'Alana King', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 78, reason: 'Leg-spin variety; good googly' },
        ],
        bench: [
          { name: 'Phoebe Litchfield', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 77, reason: 'Rising star backup' },
          { name: 'Georgia Wareham', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 74, reason: 'Leg-spin depth' },
          { name: 'Grace Harris', role: 'Batter', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 73, reason: 'Power-hitting backup' },
        ]
      },
      Test: {
        xi: [
          { name: 'Alyssa Healy', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 88, reason: 'Captain WK; Test aggression', isCaptain: true, isWK: true },
          { name: 'Beth Mooney', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 86, reason: 'Test opener; patient innings' },
          { name: 'Meg Lanning', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 92, reason: 'Greatest; Test match temperament' },
          { name: 'Ellyse Perry', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 96, reason: 'Test double century; avg 75+ in Tests' },
          { name: 'Annabel Sutherland', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 85, reason: 'Test double ton holder; pace AR' },
          { name: 'Tahlia McGrath', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Test AR; medium pace utility' },
          { name: 'Ashleigh Gardner', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 83, reason: 'Off-spin AR in Tests' },
          { name: 'Jess Jonassen', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 80, reason: 'Left-arm Test spinner' },
          { name: 'Megan Schutt', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 86, reason: 'Test opening bowler; swing' },
          { name: 'Darcie Brown', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast', impactScore: 82, reason: 'Pace in Tests; bounce threat' },
          { name: 'Sophie Molineux', role: 'Bowler (Spin)', batHand: 'LHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 76, reason: 'Left-arm orthodox support' },
        ],
        bench: [
          { name: 'Phoebe Litchfield', role: 'Batter', batHand: 'LHB', bowlStyle: '-', impactScore: 75, reason: 'Test backup batter' },
          { name: 'Georgia Wareham', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 74, reason: 'Test leg-spin' },
          { name: 'Kim Garth', role: 'Bowler (Pace)', batHand: 'LHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 72, reason: 'Seam backup' },
        ]
      }
    },
    England: {
      T20: {
        xi: [
          { name: 'Danni Wyatt', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 83, reason: 'Aggressive opener; SR 125+ in T20Is' },
          { name: 'Nat Sciver-Brunt', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 91, reason: 'World-class AR; batting avg 28 + seam', isCaptain: true },
          { name: 'Heather Knight', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 85, reason: 'Leader; WC winner, experienced' },
          { name: 'Alice Capsey', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 82, reason: 'Teen prodigy; explosive + off-spin' },
          { name: 'Amy Jones', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 79, reason: 'Experienced WK; consistent', isWK: true },
          { name: 'Sophia Dunkley', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 78, reason: 'Flair; handy leg-spin' },
          { name: 'Danielle Gibson', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 74, reason: 'Pace AR; seam + lower-order' },
          { name: 'Sophie Ecclestone', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 92, reason: 'World #1; 100+ T20I wickets, arm ball' },
          { name: 'Lauren Bell', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 80, reason: 'Tall seamer; bounce and movement' },
          { name: 'Kate Cross', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 78, reason: 'Experienced; accurate seam' },
          { name: 'Sarah Glenn', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 77, reason: 'Leg spinner; good variations' },
        ],
        bench: [
          { name: 'Tammy Beaumont', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 76, reason: 'Reliable opener backup' },
          { name: 'Freya Kemp', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 74, reason: 'Young left-arm AR' },
          { name: 'Charlie Dean', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 73, reason: 'Off-spin backup' },
        ]
      },
      ODI: {
        xi: [
          { name: 'Tammy Beaumont', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 85, reason: 'Opener; Ashes performer, elegant' },
          { name: 'Danni Wyatt', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 82, reason: 'Aggressive opener; ODI experience' },
          { name: 'Nat Sciver-Brunt', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 92, reason: 'World-class; avg 40+ bat, 80+ ODI wickets', isCaptain: true },
          { name: 'Heather Knight', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 87, reason: 'Captain; WC winner, avg 30+ in ODIs' },
          { name: 'Amy Jones', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 80, reason: 'ODI WK; reliable keeper-batter', isWK: true },
          { name: 'Alice Capsey', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 80, reason: 'Young AR; off-spin utility' },
          { name: 'Sophia Dunkley', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 78, reason: 'ODI centurion; handy leg-spin' },
          { name: 'Sophie Ecclestone', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 91, reason: 'World #1; dominant in ODIs' },
          { name: 'Kate Cross', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 80, reason: 'Experienced; 60+ ODI wickets' },
          { name: 'Lauren Bell', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 78, reason: 'Tall seamer; new ball threat' },
          { name: 'Charlie Dean', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 77, reason: 'Off-spinner; economical' },
        ],
        bench: [
          { name: 'Maia Bouchier', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 74, reason: 'Explosive backup batter' },
          { name: 'Sarah Glenn', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 75, reason: 'Leg-spin backup' },
          { name: 'Freya Kemp', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 73, reason: 'Young left-arm AR' },
        ]
      },
      Test: {
        xi: [
          { name: 'Tammy Beaumont', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 86, reason: 'Test opener; Ashes centuries' },
          { name: 'Danni Wyatt', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 78, reason: 'Test opener; aggressive approach' },
          { name: 'Heather Knight', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 87, reason: 'Captain; Test hundreds', isCaptain: true },
          { name: 'Nat Sciver-Brunt', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 92, reason: 'Test AR; avg 45 + seam bowling' },
          { name: 'Sophia Dunkley', role: 'Batter', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 80, reason: 'Test centurion; composed' },
          { name: 'Amy Jones', role: 'WK-Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 79, reason: 'Test WK; experienced', isWK: true },
          { name: 'Alice Capsey', role: 'All-Rounder', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 77, reason: 'Young Test AR' },
          { name: 'Sophie Ecclestone', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Left-Arm Orthodox', impactScore: 90, reason: 'World #1; Test match dominance' },
          { name: 'Kate Cross', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 82, reason: 'Test seam bowler; experienced' },
          { name: 'Lauren Bell', role: 'Bowler (Pace)', batHand: 'RHB', bowlStyle: 'Right-Arm Fast Medium', impactScore: 80, reason: 'Tall seamer; Test bounce' },
          { name: 'Charlie Dean', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Right-Arm Off Break', impactScore: 78, reason: 'Off-spinner; Test economy' },
        ],
        bench: [
          { name: 'Maia Bouchier', role: 'Batter', batHand: 'RHB', bowlStyle: '-', impactScore: 72, reason: 'Test backup batter' },
          { name: 'Sarah Glenn', role: 'Bowler (Spin)', batHand: 'RHB', bowlStyle: 'Leg Break', impactScore: 74, reason: 'Test leg-spin backup' },
          { name: 'Freya Kemp', role: 'All-Rounder', batHand: 'LHB', bowlStyle: 'Left-Arm Fast Medium', impactScore: 71, reason: 'Young left-arm AR' },
        ]
      }
    }
  }
}

// ─────────────────────────────────────────────
// Venue Analysis Data
// ─────────────────────────────────────────────
export const VENUE_DATA = {
  'Wankhede Stadium, Mumbai': {
    T20: { type: 'Batting-Friendly', avg1st: 172, avg2nd: 158, chasable: '165-175', paceWkts: 4.2, spinWkts: 5.8 },
    ODI: { type: 'Batting-Friendly', avg1st: 298, avg2nd: 260, chasable: '280-300', paceWkts: 5.2, spinWkts: 4.8 },
    Test: { type: 'Spin-Friendly', avg1st: 330, avg2nd: 310, chasable: '200+', paceWkts: 3.5, spinWkts: 6.5 },
  },
  'MCG, Melbourne': {
    T20: { type: 'Pace-Friendly', avg1st: 158, avg2nd: 145, chasable: '150-160', paceWkts: 6.4, spinWkts: 3.6 },
    ODI: { type: 'Pace-Friendly', avg1st: 275, avg2nd: 240, chasable: '260-270', paceWkts: 6.0, spinWkts: 4.0 },
    Test: { type: 'Balanced', avg1st: 350, avg2nd: 320, chasable: '250+', paceWkts: 6.2, spinWkts: 3.8 },
  },
  "Lord's, London": {
    T20: { type: 'Balanced', avg1st: 165, avg2nd: 155, chasable: '160-170', paceWkts: 5.5, spinWkts: 4.5 },
    ODI: { type: 'Pace-Friendly', avg1st: 260, avg2nd: 230, chasable: '250-260', paceWkts: 5.8, spinWkts: 4.2 },
    Test: { type: 'Pace-Friendly', avg1st: 310, avg2nd: 290, chasable: '220+', paceWkts: 6.5, spinWkts: 3.5 },
  },
  'M. Chinnaswamy, Bangalore': {
    T20: { type: 'High-Scoring', avg1st: 195, avg2nd: 185, chasable: '190-200', paceWkts: 4.0, spinWkts: 6.0 },
    ODI: { type: 'High-Scoring', avg1st: 315, avg2nd: 285, chasable: '300-320', paceWkts: 4.5, spinWkts: 5.5 },
    Test: { type: 'Batting-Friendly', avg1st: 400, avg2nd: 350, chasable: '250+', paceWkts: 4.0, spinWkts: 6.0 },
  }
}

export const H2H_DATA = {
  'India_Australia': { T20: { played: 32, home: 18, away: 12, nr: 2 }, ODI: { played: 148, home: 56, away: 83, nr: 9 }, Test: { played: 106, home: 32, away: 45, nr: 29 } },
  'India_England': { T20: { played: 22, home: 12, away: 8, nr: 2 }, ODI: { played: 108, home: 56, away: 44, nr: 8 }, Test: { played: 131, home: 35, away: 50, nr: 46 } },
  'Australia_England': { T20: { played: 24, home: 10, away: 12, nr: 2 }, ODI: { played: 153, home: 82, away: 62, nr: 9 }, Test: { played: 357, home: 148, away: 112, nr: 97 } },
  'Australia_India': { T20: { played: 32, home: 12, away: 18, nr: 2 }, ODI: { played: 148, home: 83, away: 56, nr: 9 }, Test: { played: 106, home: 45, away: 32, nr: 29 } },
  'England_India': { T20: { played: 22, home: 8, away: 12, nr: 2 }, ODI: { played: 108, home: 44, away: 56, nr: 8 }, Test: { played: 131, home: 50, away: 35, nr: 46 } },
  'England_Australia': { T20: { played: 24, home: 12, away: 10, nr: 2 }, ODI: { played: 153, home: 62, away: 82, nr: 9 }, Test: { played: 357, home: 112, away: 148, nr: 97 } },
}

// ─────────────────────────────────────────────
// Mock Stats Generator
// ─────────────────────────────────────────────
const generateMockStats = (player, format) => {
  const isTest = format === 'Test'
  const isT20 = format === 'T20'
  const isBat = ['Batter', 'WK-Batter', 'All-Rounder'].includes(player.role)
  const isBowl = ['Bowler (Pace)', 'Bowler (Spin)', 'All-Rounder'].includes(player.role)
  const stats = {}
  if (isBat) {
    stats.batting = {
      recent: isTest ? '78, 14, 102*, 5, 45' : (isT20 ? '45, 12, 88*, 10, 31' : '65, 112, 10, 4, 89'),
      vsOpponent: { avg: (Math.random() * 20 + (isTest ? 35 : 25)).toFixed(1), sr: (Math.random() * (isT20 ? 30 : 20) + (isT20 ? 120 : (isTest ? 45 : 80))).toFixed(1), runs: Math.floor(Math.random() * 500 + 200) },
      venue: { avg: (Math.random() * 30 + 20).toFixed(1), matches: Math.floor(Math.random() * 5 + 1), highScore: Math.floor(Math.random() * 100 + 40) }
    }
  }
  if (isBowl) {
    stats.bowling = {
      recent: isTest ? '4/55, 1/12, 5/89' : (isT20 ? '2/24, 0/35, 3/18' : '3/45, 1/50, 2/30'),
      vsOpponent: { avg: (Math.random() * 10 + 20).toFixed(1), econ: (Math.random() * (isT20 ? 3 : 2) + (isT20 ? 6.5 : (isTest ? 2.0 : 4.5))).toFixed(2), wickets: Math.floor(Math.random() * 25 + 5) },
      venue: { wickets: Math.floor(Math.random() * 10 + 1), matches: Math.floor(Math.random() * 5 + 1), best: `${Math.floor(Math.random() * 4 + 2)}/${Math.floor(Math.random() * 30 + 15)}` }
    }
  }
  return stats
}

// ─────────────────────────────────────────────
// Premium Player Card (JioHotstar style)
// ─────────────────────────────────────────────
const PlayerCard = ({ player, index, onClick, isLeft }) => {
  const colors = ROLE_COLORS[player.role] || ROLE_COLORS['Batter']
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -80 : 80, scale: 0.85, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 140, damping: 18 }}
      whileHover={{ scale: 1.02, y: -3 }}
      onClick={() => onClick(player)}
      className={`relative cursor-pointer group rounded-2xl overflow-hidden border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm shadow-lg hover:shadow-2xl ${colors.glow} transition-all duration-300`}
    >
      {/* Premium Sheen Wipe */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ delay: index * 0.12 + 0.3, duration: 0.8, ease: "easeInOut" }}
        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 z-20 pointer-events-none"
      />

      {/* Accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: colors.accent }} />
      
      <div className="pl-5 pr-4 py-4 flex items-center gap-4">
        {/* Jersey number style avatar */}
        <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
          <span className="text-2xl font-black leading-none" style={{ color: colors.accent }}>{player.name.split(' ').pop()[0]}</span>
          <span className="text-[7px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{player.batHand}</span>
          {player.isCaptain && <div className="absolute -top-0.5 -right-0.5 bg-yellow-500 text-black text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">C</div>}
          {player.isWK && <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white text-[6px] font-black w-5 h-3.5 rounded-full flex items-center justify-center shadow">WK</div>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-bold text-white truncate leading-tight">{player.name}</h4>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${colors.badge} uppercase tracking-widest`}>
              {player.role === 'Bowler (Pace)' ? 'Pace' : player.role === 'Bowler (Spin)' ? 'Spin' : player.role}
            </span>
            {player.bowlStyle && player.bowlStyle !== '-' && (
              <span className="text-[9px] text-gray-500 font-medium">{player.bowlStyle}</span>
            )}
          </div>
          <p className="text-[9px] text-gray-600 mt-1.5 truncate italic flex items-center gap-1">
            <Target size={8} className="shrink-0 text-gray-700" />
            {player.reason}
          </p>
        </div>

        {/* Impact Score */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 w-14">
          <div className="flex items-center gap-1">
            <Zap size={11} style={{ color: colors.accent }} />
            <span className="text-base font-black text-white">{player.impactScore}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${player.impactScore}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              className="h-full rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
          </div>
        </div>
        <ChevronRight size={14} className="text-gray-700 group-hover:text-white transition-colors shrink-0" />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Stats Modal
// ─────────────────────────────────────────────
const StatsModal = ({ player, format, onClose }) => {
  const stats = useMemo(() => generateMockStats(player, format), [player.name, format])
  const colors = ROLE_COLORS[player.role] || ROLE_COLORS['Batter']
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="relative bg-[#0F1420] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="relative p-6 border-b border-white/10" style={{ background: `linear-gradient(135deg, ${colors.accent}15, transparent)` }}>
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-black" style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>{player.name.split(' ').pop()[0]}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{player.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${colors.badge} uppercase tracking-widest`}>{player.role}</span>
                <span className="text-[10px] text-gray-400">{player.batHand}</span>
                {player.bowlStyle !== '-' && <span className="text-[10px] text-gray-500">• {player.bowlStyle}</span>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><X size={18} /></button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Zap size={14} style={{ color: colors.accent }} />
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${player.impactScore}%` }} className="h-full rounded-full" style={{ backgroundColor: colors.accent }} /></div>
            <span className="text-sm font-black text-white">{player.impactScore}/100</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic">{player.reason}</p>
        </div>
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-5">
          {stats.batting && (
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Batting ({format})</h3>
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 space-y-3">
                <div><p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Recent</p><p className="text-sm font-mono text-white">{stats.batting.recent}</p></div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  <div><p className="text-[9px] text-gray-600 uppercase font-bold mb-2">Vs Opponent</p><div className="flex gap-4"><div><p className="text-[10px] text-gray-500">Avg</p><p className="text-base font-bold text-white">{stats.batting.vsOpponent.avg}</p></div><div><p className="text-[10px] text-gray-500">SR</p><p className="text-base font-bold text-white">{stats.batting.vsOpponent.sr}</p></div></div></div>
                  <div><p className="text-[9px] text-gray-600 uppercase font-bold mb-2">At Venue</p><div className="flex gap-4"><div><p className="text-[10px] text-gray-500">Matches</p><p className="text-base font-bold text-white">{stats.batting.venue.matches}</p></div><div><p className="text-[10px] text-gray-500">HS</p><p className="text-base font-bold text-white">{stats.batting.venue.highScore}</p></div></div></div>
                </div>
              </div>
            </div>
          )}
          {stats.bowling && (
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Bowling ({format})</h3>
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 space-y-3">
                <div><p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Recent</p><p className="text-sm font-mono text-white">{stats.bowling.recent}</p></div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  <div><p className="text-[9px] text-gray-600 uppercase font-bold mb-2">Vs Opponent</p><div className="flex gap-4"><div><p className="text-[10px] text-gray-500">Wkts</p><p className="text-base font-bold text-white">{stats.bowling.vsOpponent.wickets}</p></div><div><p className="text-[10px] text-gray-500">Econ</p><p className="text-base font-bold text-white">{stats.bowling.vsOpponent.econ}</p></div></div></div>
                  <div><p className="text-[9px] text-gray-600 uppercase font-bold mb-2">At Venue</p><div className="flex gap-4"><div><p className="text-[10px] text-gray-500">Wkts</p><p className="text-base font-bold text-white">{stats.bowling.venue.wickets}</p></div><div><p className="text-[10px] text-gray-500">Best</p><p className="text-base font-bold text-white">{stats.bowling.venue.best}</p></div></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Section label
const SectionLabel = ({ label, color }) => (
  <div className="flex items-center gap-2 mb-3 mt-5 first:mt-0">
    <div className="w-2 h-5 rounded-full" style={{ backgroundColor: color }} />
    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</h3>
    <div className="flex-1 h-px bg-white/5" />
  </div>
)

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const PlayingXIReveal = () => {
  const request = useMatchStore()
  const navigate = useNavigate()
  
  const getSquad = (team) => {
    const s = SQUADS[request.gender]?.[team]?.[request.format]
    if (s) return s
    return { xi: [], bench: [] }
  }

  const homeSquad = useMemo(() => getSquad(request.homeTeam), [request.homeTeam, request.gender, request.format])
  const awaySquad = useMemo(() => getSquad(request.awayTeam), [request.awayTeam, request.gender, request.format])

  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [homeRevealed, setHomeRevealed] = useState(false)
  const [awayRevealed, setAwayRevealed] = useState(false)

  const venueInfo = VENUE_DATA[request.venue]?.[request.format] || { type: 'Balanced', avg1st: 170, avg2nd: 160, chasable: '165-175', paceWkts: 5, spinWkts: 5 }
  const h2hKey = `${request.homeTeam}_${request.awayTeam}`
  const h2h = H2H_DATA[h2hKey]?.[request.format] || { played: 0, home: 0, away: 0, nr: 0 }

  const TeamColumn = ({ teamName, squad, isRevealed, onReveal, isLeft }) => (
    <div className="flex-1 flex flex-col bg-[#0B0F19]/80 border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/[0.06] flex items-center gap-4 bg-gradient-to-r from-[#0B0F19] to-[#151B2B]">
        <img src={`https://flagcdn.com/w80/${getFlag(teamName)}.png`} alt={teamName} className="w-12 rounded shadow-md border border-white/10" />
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">{teamName}</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{request.gender}'s {request.format} • Playing XI</p>
        </div>
      </div>

      {!isRevealed ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={onReveal} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E676] to-[#3B82F6] rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-[#0B0F19] text-white font-bold py-4 px-10 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl">
              <TrendingUp size={18} className="text-[#00E676]" />
              Reveal XI for {teamName}
            </div>
          </motion.button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide relative">
          <SectionLabel label="Top Order" color="#3B82F6" />
          <div className="space-y-2">{squad.xi.slice(0, 3).map((p, i) => <PlayerCard key={p.name} player={p} index={i} onClick={setSelectedPlayer} isLeft={isLeft} />)}</div>
          <SectionLabel label="Middle Order" color="#8B5CF6" />
          <div className="space-y-2">{squad.xi.slice(3, 7).map((p, i) => <PlayerCard key={p.name} player={p} index={i + 3} onClick={setSelectedPlayer} isLeft={isLeft} />)}</div>
          <SectionLabel label="Lower Order & Bowlers" color="#EF4444" />
          <div className="space-y-2">{squad.xi.slice(7, 11).map((p, i) => <PlayerCard key={p.name} player={p} index={i + 7} onClick={setSelectedPlayer} isLeft={isLeft} />)}</div>
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <SectionLabel label="Bench" color="#6B7280" />
            <div className="space-y-2">{squad.bench.map((p, i) => <PlayerCard key={p.name} player={p} index={i + 11} onClick={setSelectedPlayer} isLeft={isLeft} />)}</div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-[#080C14] min-h-[calc(100vh-6rem)] rounded-2xl p-6 lg:p-8 flex flex-col font-inter relative overflow-hidden mb-12">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#00E676]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Squad Predictions</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-[#00E676]">{request.homeTeam}</span>
            <span className="text-gray-600">vs</span>
            <span className="text-blue-400">{request.awayTeam}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="text-gray-400">{request.format}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="text-gray-400">{request.gender}</span>
          </p>
        </div>
      </div>

      {/* Venue & H2H Info Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-[#00E676]" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Venue Analysis</h3>
          </div>
          <p className="text-sm font-bold text-white mb-2">{request.venue}</p>
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">Type</p><p className="text-xs font-bold text-[#00E676]">{venueInfo.type}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">Avg 1st</p><p className="text-xs font-bold text-white">{venueInfo.avg1st}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">Avg 2nd</p><p className="text-xs font-bold text-white">{venueInfo.avg2nd}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">Chase</p><p className="text-xs font-bold text-white">{venueInfo.chasable}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">Pace/Spin</p><p className="text-xs font-bold text-white">{venueInfo.paceWkts}/{venueInfo.spinWkts}</p></div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-yellow-500" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">H2H Record ({request.format})</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">Played</p><p className="text-lg font-black text-white">{h2h.played}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">{request.homeTeam}</p><p className="text-lg font-black text-[#00E676]">{h2h.home}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">{request.awayTeam}</p><p className="text-lg font-black text-yellow-400">{h2h.away}</p></div>
            <div className="text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">{request.format === 'Test' ? 'Draw' : 'NR'}</p><p className="text-lg font-black text-gray-400">{h2h.nr}</p></div>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative z-10">
        <TeamColumn teamName={request.homeTeam} squad={homeSquad} isRevealed={homeRevealed} onReveal={() => setHomeRevealed(true)} isLeft={true} />
        <div className="hidden lg:flex flex-col items-center justify-center -mx-3 z-20 pointer-events-none">
          <div className="w-10 h-10 bg-[#080C14] rounded-full border border-white/10 flex items-center justify-center text-gray-600 font-black italic text-sm shadow-xl">VS</div>
        </div>
        <TeamColumn teamName={request.awayTeam} squad={awaySquad} isRevealed={awayRevealed} onReveal={() => setAwayRevealed(true)} isLeft={false} />
      </div>

      <div className="flex gap-4 mt-8 relative z-10">
        <button onClick={() => navigate('/app/matchups')} className="flex-1 bg-[#3B82F6]/20 border border-[#3B82F6]/50 text-[#3B82F6] hover:bg-[#3B82F6]/30 py-3 rounded-xl font-bold transition-colors">
          View Head-to-Head Matchups
        </button>
        <button onClick={() => navigate('/app/analytics')} className="flex-1 bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/30 py-3 rounded-xl font-bold transition-colors">
          View Deep Analytics
        </button>
      </div>

      <AnimatePresence>
        {selectedPlayer && <StatsModal player={selectedPlayer} format={request.format} onClose={() => setSelectedPlayer(null)} />}
      </AnimatePresence>
    </div>
  )
}

export default PlayingXIReveal
