import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import FeaturesGrid from "./FeaturesGrid";
import GmailCTA from "./GmailCTA";

/** Root homepage component — composes all homepage sections in order. */
export default function Hero() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <FeaturesGrid />
      <GmailCTA />
    </div>
  );
}
