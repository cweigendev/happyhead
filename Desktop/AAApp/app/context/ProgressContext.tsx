'use client'

import React, { createContext, useContext, useState } from 'react'

type ProgressContextType = {
  currentStep: number
  totalSteps: number
  setCurrentStep: (step: number) => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 9 // Updated to include the new Medical Records page

  return (
    <ProgressContext.Provider value={{ currentStep, totalSteps, setCurrentStep }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

