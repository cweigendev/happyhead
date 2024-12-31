'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useProgress } from '../context/ProgressContext'

export default function IDUploadPage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()
  const [clientID, setClientID] = useState<File | null>(null)
  const [otherPartyID, setOtherPartyID] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Client ID:", clientID)
    console.log("Other Party ID:", otherPartyID)
    setCurrentStep(7)
    router.push('/health-insurance')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">ID Upload</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientID">Client's ID/Driver's License (Optional)</Label>
            <Input
              id="clientID"
              type="file"
              onChange={(e) => handleFileChange(e, setClientID)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="otherPartyID">Other Party's ID/Driver's License (Optional)</Label>
            <Input
              id="otherPartyID"
              type="file"
              onChange={(e) => handleFileChange(e, setOtherPartyID)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(6)
                router.push('/parties-involved')
              }}
            >
              Back
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Next</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

