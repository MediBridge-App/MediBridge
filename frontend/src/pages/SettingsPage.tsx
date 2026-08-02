import { useState } from 'react'
import SettingsSidebar from '../components/settings/SettingsSidebar'
import OrganizationSettings from '../components/settings/OrganizationSettings'
import AppearanceSettings from '../components/settings/AppearanceSettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import AWSSettings from '../components/settings/AWSSettings'
import DataRetentionSettings from '../components/settings/DataRetentionSettings'
import APIWebhooksSettings from '../components/settings/APIWebhooksSettings'

type SettingsSection =
    | 'organization'
    | 'appearance'
    | 'notifications'
    | 'aws'
    | 'data'
    | 'api'

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<SettingsSection>('organization')

    return (
        <div className="flex gap-8 p-6">
            <SettingsSidebar
                active={activeSection}
                onChange={setActiveSection}
            />
            <div className="flex-1 min-w-0">
                {activeSection === 'organization' && <OrganizationSettings />}
                {activeSection === 'appearance' && <AppearanceSettings />}
                {activeSection === 'notifications' && <NotificationSettings />}
                {activeSection === 'aws' && <AWSSettings />}
                {activeSection === 'data' && <DataRetentionSettings />}
                {activeSection === 'api' && <APIWebhooksSettings />}
            </div>
        </div>
    )
}
