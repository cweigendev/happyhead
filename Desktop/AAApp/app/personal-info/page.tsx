'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useProgress } from '../context/ProgressContext'

export default function PersonalInfoPage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    emergencyContact: '',
    preferredCommunication: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    setCurrentStep(3)
    router.push('/accident-details')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Personal Information</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Preferred Method of Communication (Optional)</Label>
            <RadioGroup
              name="preferredCommunication"
              value={formData.preferredCommunication}
              onValueChange={(value) => setFormData(prev => ({ ...prev, preferredCommunication: value }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="r-email" />
                <Label htmlFor="r-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="r-phone" />
                <Label htmlFor="r-phone">Phone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="r-text" />
                <Label htmlFor="r-text">Text</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(2)
                router.push('/case-type')
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

