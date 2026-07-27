import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'

export default function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    useEffect(() => {
        async function checkAuth() {
            try {
                await getCurrentUser()
                setIsAuthenticated(true)
            } catch {
                setIsAuthenticated(false)
            }
        }
        checkAuth()
    }, [])

    // Still checking
    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
        )
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Authenticated → show the page
    return <Outlet />
}