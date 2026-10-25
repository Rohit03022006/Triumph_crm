import React from 'react'
import { Button } from '@/components/ui/button'
import ReportsChart from '@/components/Reports_Management/ReportsChart'

const Reports = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Reports</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-border">
            Export Report
          </Button>
        </div>
      </div>
      <ReportsChart />
    </>
  )
}

export default Reports
