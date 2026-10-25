import React from 'react'
import SettingsPanel from '@/components/Admin_Management/SettingsPanel'

const Settings = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">System Resources</h2>
      </div>
      <SettingsPanel />
    </>
  )
}

export default Settings
