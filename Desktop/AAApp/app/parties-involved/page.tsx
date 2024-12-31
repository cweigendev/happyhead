'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProgress } from '../context/ProgressContext'

export default function PartiesInvolvedPage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()
  const [formData, setFormData] = useState({
    otherPartyName: '',
    otherPartyContact: '',
    otherPartyInsurance: '',
    witnessInformation: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    setCurrentStep(7)
    router.push('/id-upload')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Parties Involved</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otherPartyName">Other Party's Name (Optional)</Label>
            <Input
              id="otherPartyName"
              name="otherPartyName"
              value={formData.otherPartyName}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="otherPartyContact">Other Party's Contact Info (Optional)</Label>
            <Input
              id="otherPartyContact"
              name="otherPartyContact"
              value={formData.otherPartyContact}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="otherPartyInsurance">Other Party's Insurance Info (Optional)</Label>
            <Input
              id="otherPartyInsurance"
              name="otherPartyInsurance"
              value={formData.otherPartyInsurance}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="witnessInformation">Witness Information (Optional)</Label>
            <Textarea
              id="witnessInformation"
              name="witnessInformation"
              value={formData.witnessInformation}
              onChange={handleInputChange}
              placeholder="Please provide any witness information here"
              className="mt-1"
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(5)
                router.push('/medical-records')
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

