import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Hero from "@/components/Hompage/Hero";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
      <Hero />
      </section>
    </main>
  );
}
