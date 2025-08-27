import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Using Inter as a close alternative to Satoshi for now
// To use actual Satoshi, replace this with localFont and add Satoshi font files
const satoshi = Inter({
  subsets: ["latin"],
  variable: "--font-satoshi",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

const satoshiMono = Inter({
  subsets: ["latin"],
  variable: "--font-satoshi-mono",
  weight: ["400"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "HHS Studio",
  description: "3D Product Customization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${satoshi.variable} ${satoshiMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
