import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// 导入你的组件
import Dashboard from './components/Dashboard'
import FoodLogger from './components/FoodLogger'
import CalendarView from './components/CalendarView'
import Profile from './components/Profile'
import Analysis from './components/Analysis'
import Onboarding from './components/Onboarding'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log-food" element={<FoodLogger />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
