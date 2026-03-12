import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import { VitalsProvider } from "@/components/VitalsEngine";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "Vitals | AI Digital Wellbeing",
  description: "Monitor your digital health and mental stress automatically.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-[#050505] text-white min-h-screen relative`}>
        {/* Background Orbs */}
        <div className="orb w-96 h-96 bg-purple-600 top-[-10%] left-[-5%]" />
        <div className="orb w-80 h-80 bg-pink-600 bottom-[10%] right-[-5%] animation-delay-2000" />
        
        <VitalsProvider>
          <main className="relative z-10">
            {children}
          </main>
        </VitalsProvider>
      </body>
    </html>
  );
}
