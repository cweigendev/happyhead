import Header from "@/components/Header";
import { ShaderBackground } from "@/components/ShaderBackground";
import { ButtonCta } from "@/components/ui/ButtonCta";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Shader Background */}
      <div className="fixed inset-0 z-0">
        <ShaderBackground />
        {/* Dark overlay to darken the background */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Header Navigation */}
      <div className="relative z-20">
        <Header />
      </div>
      
      {/* Centered Logo */}
      <div className="relative z-10 flex items-center justify-center" style={{ height: 'calc(100vh + 180px)', marginTop: '-240px' }}>
        <div className="flex flex-col items-center space-y-16">
          <Image
            src="/applogo/hhs.png"
            alt="HHS Logo"
            width={160}
            height={160}
            className="w-auto h-24 md:h-32 lg:h-40 transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3))',
              WebkitFilter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3))'
            }}
            priority
          />
          <Link href="/studio">
            <ButtonCta label="Enter Studio" className="h-12 px-8 text-base" />
          </Link>
        </div>
      </div>
    </div>
  );
}
