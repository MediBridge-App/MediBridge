import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InboxPage from './pages/InboxPage'
import SendDocumentPage from './pages/SendDocumentPage'
import AuditTrailPage from './pages/AuditTrailPage'
import AIAnalysisPage from './pages/AIAnalysisPage'
import NotificationsPage from './pages/NotificationsPage'
import SecurityPage from './pages/SecurityPage'
import SettingsPage from './pages/SettingsPage'
import { InboxProvider } from './context/InboxContext'
import { NotificationsProvider } from './context/NotificationsContext'
import ProfilePanel from './components/layout/ProfilePanel'
import { useState } from 'react'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [showProfile, setShowProfile] = useState(false)
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <InboxProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                {/* Protected — all wrapped in sidebar layout */}
                <Route element={<AppLayout onProfileClick={() => setShowProfile(true)} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/inbox" element={<InboxPage />} />
                  <Route path="/send" element={<SendDocumentPage />} />
                  <Route path="/audit" element={<AuditTrailPage />} />
                  <Route path="/ai-analysis" element={<AIAnalysisPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
              {/* Default */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            {showProfile && (
              <ProfilePanel onClose={() => setShowProfile(false)} />
            )}
          </InboxProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App