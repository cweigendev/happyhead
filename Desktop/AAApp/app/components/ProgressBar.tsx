'use client'

import { useProgress } from '../context/ProgressContext'

export const ProgressBar = () => {
  const { currentStep, totalSteps } = useProgress()
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-md mb-6">
      <div className="bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

