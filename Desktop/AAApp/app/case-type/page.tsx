'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useProgress } from '../context/ProgressContext'

const caseTypes = [
  'Auto Accident',
  'Premise Liability',
  'Dog Bite',
  'Wrongful Death',
  'Commercial/Semi Accident',
  'Product Liability'
]

export default function CaseTypePage() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const { setCurrentStep } = useProgress()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ProgressBar />
      <h1 className="text-3xl font-bold mb-6">Select Your Case Type</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {caseTypes.map((caseType) => (
          <Card
            key={caseType}
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedCase === caseType
                ? 'bg-primary/20 border-primary'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCase(caseType)}
          >
            {caseType}
          </Card>
        ))}
      </div>
      <Link href="/personal-info">
        <Button
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
          disabled={!selectedCase}
          onClick={() => setCurrentStep(2)}
        >
          Next
        </Button>
      </Link>
    </div>
  )
}

