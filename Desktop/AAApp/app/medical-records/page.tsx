'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProgress } from '../context/ProgressContext'
import { Upload } from 'lucide-react'

export default function MedicalRecordsPage() {
  const router = useRouter()
  const { setCurrentStep } = useProgress()
  const [files, setFiles] = useState<File[]>([])
  const [descriptions, setDescriptions] = useState(['', ''])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleDescriptionChange = (index: number, value: string) => {
    setDescriptions(prev => {
      const newDescriptions = [...prev]
      newDescriptions[index] = value
      return newDescriptions
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Files:", files)
    console.log("Descriptions:", descriptions)
    setCurrentStep(6)
    router.push('/parties-involved')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Medical Records</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="medicalRecords">Upload Medical Records (Optional)</Label>
            <Input
              id="medicalRecords"
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>
          {files.length > 0 && (
            <div>
              <p className="font-semibold">{files.length} file(s) selected</p>
              <ul className="list-disc list-inside">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <Label htmlFor="description1">Description of Document 1 (Optional)</Label>
            <Textarea
              id="description1"
              value={descriptions[0]}
              onChange={(e) => handleDescriptionChange(0, e.target.value)}
              placeholder="Describe the first document or set of documents"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description2">Description of Document 2 (Optional)</Label>
            <Textarea
              id="description2"
              value={descriptions[1]}
              onChange={(e) => handleDescriptionChange(1, e.target.value)}
              placeholder="Describe the second document or set of documents"
              className="mt-1"
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(4)
                router.push('/injury-photos')
              }}
            >
              Back
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" />
              Upload and Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

