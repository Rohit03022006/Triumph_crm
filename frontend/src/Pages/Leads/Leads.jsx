import React from 'react'
import { Button } from '@/components/ui/button'
import LeadTable from '@/components/Lead_Management/LeadTable'

const Leads = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Leads</h2>
        <div className="flex items-center gap-4">
          <Button className="bg-primary hover:bg-brand-dark text-primary-foreground">
            Add Lead
          </Button>
        </div>
      </div>
      <LeadTable />
    </>
  )
}

export default Leads
