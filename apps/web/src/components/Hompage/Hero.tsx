import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import FeaturesGrid from "./FeaturesGrid";
import MiniPayCTA from "./MiniPayCTA";
import FAQ from "./FAQ";

/** Root homepage component — composes all homepage sections in order. */
export default function Hero() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <FeaturesGrid />
      <MiniPayCTA />
      <FAQ />
    </div>
  );
}
