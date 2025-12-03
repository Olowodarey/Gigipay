import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Mail, Wallet, CreditCard, Gift } from 'lucide-react'

const Hero = () => {
  return (
    <div>
            <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Pay Anyone, Anywhere - Just Gmail Needed
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
                Workers receive crypto payments with just their Gmail. No wallet
                setup. Convert to gift cards instantly. Zero crypto knowledge
                required.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-accent" />
                <span>Sign up with Gmail</span>
                <ArrowRight className="h-4 w-4" />
                <Wallet className="h-4 w-4 text-accent" />
                <span>Auto wallet</span>
                <ArrowRight className="h-4 w-4" />
                <CreditCard className="h-4 w-4 text-accent" />
                <span>Gift cards</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/create">
                    Pay Team / Create Giveaway
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base bg-transparent"
                >
                  <Link href="/claim">Claim Payment</Link>
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Mystery Prize
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Amount hidden until claimed
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded-full w-3/4" />
                      <div className="h-3 bg-muted rounded-full w-1/2" />
                      <div className="h-3 bg-muted rounded-full w-5/6" />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="text-3xl font-bold text-accent">???</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Surprise amount in Celo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Hero