'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useProgress } from '../context/ProgressContext'
import { Camera, Upload, FileText } from 'lucide-react'
import { processImages } from '../actions/processImages'
import { useToast } from "@/components/ui/use-toast"

export default function InjuryPhotosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentStep } = useProgress()
  const [photos, setPhotos] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // First, process images with OCR
      const formData = new FormData()
      photos.forEach(photo => {
        formData.append('files', photo)
      })

      const result = await processImages(formData)

      if (result.success) {
        toast({
          title: "OCR Processing Complete",
          description: "Text has been extracted from your images and saved.",
          action: (
            <a
              href={result.filePath}
              download
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-4 py-2"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Results
            </a>
          ),
        })
      } else {
        toast({
          title: "Processing Error",
          description: "Failed to process images. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error processing images:', error)
      toast({
        title: "Processing Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    // Continue with normal form submission
    setCurrentStep(5)
    router.push('/medical-records')
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ProgressBar />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload Injury Photos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photos" className="block">Select Photos of Injuries (Optional)</Label>
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="photos"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Label>
            </div>
          </div>
          {photos.length > 0 && (
            <div>
              <p className="font-semibold">{photos.length} photo(s) selected</p>
              <ul className="list-disc list-inside">
                {photos.map((photo, index) => (
                  <li key={index} className="text-sm text-gray-600">{photo.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(3)
                router.push('/accident-details')
              }}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Upload and Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

