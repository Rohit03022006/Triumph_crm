import React from 'react'
import ApprovedList from '@/components/Approved_Management/ApprovedList'

const Approved = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Approved</h2>
      </div>
      <ApprovedList />
    </>
  )
}

export default Approved