import React from 'react'
import { Button } from '@/components/ui/button'
import DashboardStats from '@/components/Dashboard_Mangement/DashboardStats'

const Dashboard = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Dashboard</h2>
        <div className="flex items-center gap-4">
          <Button className="bg-primary hover:bg-brand-dark text-primary-foreground">
            Add Lead
          </Button>
        </div>
      </div>
      
      {/* Dashboard Stats Component */}
      <DashboardStats />
    </>
  )
}

export default Dashboard
