'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useProgress } from '../context/ProgressContext'

export default function HealthInsurancePage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()
  const [formData, setFormData] = useState({
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    householdInsurance: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    setCurrentStep(8)
    // Navigate to a completion page or show a completion message
    router.push('/completion')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Health Insurance Information</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="insuranceProvider">Insurance Provider (Optional)</Label>
            <Input
              id="insuranceProvider"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="policyNumber">Policy Number (Optional)</Label>
            <Input
              id="policyNumber"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="groupNumber">Group Number (Optional)</Label>
            <Input
              id="groupNumber"
              name="groupNumber"
              value={formData.groupNumber}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Does anyone in your household have insurance? (Optional)</Label>
            <RadioGroup
              name="householdInsurance"
              value={formData.householdInsurance}
              onValueChange={(value) => setFormData(prev => ({ ...prev, householdInsurance: value }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="r-yes" />
                <Label htmlFor="r-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="r-no" />
                <Label htmlFor="r-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-sure" id="r-not-sure" />
                <Label htmlFor="r-not-sure">Not Sure</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(7)
                router.push('/id-upload')
              }}
            >
              Back
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

