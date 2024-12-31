import Image from 'next/image'
import Link from 'next/link'
import { ProgressBar } from './components/ProgressBar'
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ProgressBar />
      <div className="text-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aa-vertical-full-color-black-9oRxle4FUER9NEyTrJ8NGeLZSHOWYw.png"
          alt="Adamson Ahdoot Injury Attorneys"
          width={300}
          height={225}
          className="mx-auto mb-8"
          priority
        />
        <h1 className="text-3xl font-bold mb-4">Your Recovery Starts Here.</h1>
        <p className="text-gray-600 mb-8">
          Before we begin, please make sure you have all necessary documents ready for upload.
          This will help streamline the process and ensure a smooth experience.
        </p>
        <Link href="/case-type">
          <Button className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}

