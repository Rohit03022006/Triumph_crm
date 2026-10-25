import React from 'react'

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div className="p-6 rounded-lg border border-border bg-card">Total Leads</div>
      <div className="p-6 rounded-lg border border-border bg-card">Closed Leads</div>
      <div className="p-6 rounded-lg border border-border bg-card">Inventory Count</div>
      <div className="p-6 rounded-lg border border-border bg-card">Reminders Due</div>
    </div>
  )
}

export default DashboardStats
