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
import { InboxProvider } from './components/context/InboxContext'


function App() {
  return (
    <BrowserRouter>
    <InboxProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — all wrapped in sidebar layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/send" element={<SendDocumentPage />} />
          <Route path="/audit" element={<AuditTrailPage />} />
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </InboxProvider>
    </BrowserRouter>
  )
}

export default App