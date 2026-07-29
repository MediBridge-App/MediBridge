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

    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}