import React from 'react'
import { Button } from '@/components/ui/button'
import InventoryGrid from '@/components/Inventory_Management/InventoryGrid'

const Inventory = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Inventory</h2>
        <div className="flex items-center gap-4">
          <Button className="bg-primary hover:bg-brand-dark text-primary-foreground">
            Add Inventory
          </Button>
        </div>
      </div>
      <InventoryGrid />
    </>
  )
}

export default Inventory
