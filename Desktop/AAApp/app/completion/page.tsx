'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { useProgress } from '../context/ProgressContext'

export default function CompletionPage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Submission Complete</h1>
        <p className="mb-6">Thank you for submitting your information. We will review your case and contact you soon.</p>
        <Button
          onClick={() => {
            setCurrentStep(1)
            router.push('/')
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Return to Home
        </Button>
      </div>
    </div>
  )
}

