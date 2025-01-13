import { HeroSection } from "@/components/hero-section"
import { BenefitsSection } from "@/components/sections/benefits-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { Footer } from "../components/sections/footer"

export default function Home() {
  return (
    <main className="size-full min-h-screen relative">
      <div className="bg-[url(/background.png)] bg-cover h-screen w-screen absolute inset-0 -z-10 pointer-events-none">
        <div className="bg-gradient-to-t size-full from-background to-background/0 to-30%"></div>
      </div>

      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <Footer />
    </main>
  )
}
