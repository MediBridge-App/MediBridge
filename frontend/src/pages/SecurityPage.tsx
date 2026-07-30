import { useState, useEffect } from 'react'
import SecurityCards from '../components/security/SecurityCards'
import AuthControls from '../components/security/AuthControls'
import UserAccessList from '../components/security/UserAccessList'
import AWSInfrastructure from '../components/security/AWSInfrastructure'
import { usersApi, securityApi } from '../api'

export default function SecurityPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                await Promise.all([
                    usersApi.getAll(),
                    securityApi.getSettings(),
                ])
                // will wire up props when backend is ready
            } catch {
                // API not ready yet
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
                <p className="text-sm text-slate-500 mt-1">
                    HIPAA-compliant security controls and access management
                </p>
            </div>

            <SecurityCards />
            <AuthControls />
            <UserAccessList />
            <AWSInfrastructure />
        </div>
    )
}