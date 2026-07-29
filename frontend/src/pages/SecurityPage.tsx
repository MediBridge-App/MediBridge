import SecurityCards from '../components/security/SecurityCards'
import AuthControls from '../components/security/AuthControls'
import UserAccessList from '../components/security/UserAccessList'
import AWSInfrastructure from '../components/security/AWSInfrastructure'

export default function SecurityPage() {
    return (
        <div className="space-y-6 p-6">

            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
                <p className="text-sm text-slate-500 mt-1">
                    HIPAA-compliant security controls and access management
                </p>
            </div>

            {/* Info cards */}
            <SecurityCards />

            {/* Auth controls */}
            <AuthControls />

            {/* User access */}
            <UserAccessList />

            {/* AWS Infrastructure */}
            <AWSInfrastructure />

        </div>
    )
}