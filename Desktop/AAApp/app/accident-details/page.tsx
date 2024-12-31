'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProgress } from '../context/ProgressContext'

export default function AccidentDetailsPage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()
  const [formData, setFormData] = useState({
    dateOfAccident: '',
    timeOfAccident: '',
    location: '',
    description: '',
    weatherConditions: '',
    policeReportNumber: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    setCurrentStep(4)
    router.push('/injury-photos')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Accident Details</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dateOfAccident">Date of Accident (Optional)</Label>
            <Input
              id="dateOfAccident"
              name="dateOfAccident"
              type="date"
              value={formData.dateOfAccident}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="timeOfAccident">Time of Accident (Optional)</Label>
            <Input
              id="timeOfAccident"
              name="timeOfAccident"
              type="time"
              value={formData.timeOfAccident}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description of Incident (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="weatherConditions">Weather Conditions (Optional)</Label>
            <Input
              id="weatherConditions"
              name="weatherConditions"
              value={formData.weatherConditions}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="policeReportNumber">Police Report Number (Optional)</Label>
            <Input
              id="policeReportNumber"
              name="policeReportNumber"
              value={formData.policeReportNumber}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(2)
                router.push('/personal-info')
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

