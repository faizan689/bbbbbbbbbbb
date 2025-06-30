import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Users, TrendingUp, Shield } from "lucide-react";

export default function Home() {

  const features = [
    {
      icon: Building2,
      title: "Tokenized Properties",
      description: "Each property is represented as blockchain tokens, enabling fractional ownership and transparent transactions."
    },
    {
      icon: Users,
      title: "Co-Ownership",
      description: "Pool resources with other investors to access premium real estate markets previously out of reach."
    },
    {
      icon: TrendingUp,
      title: "Smart Returns",
      description: "Automated dividend distribution and capital appreciation tracking through smart contracts."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Built on ICP blockchain with integrated KYC/AML verification and regulatory compliance."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Designing Your
                  <br />
                  <span className="text-white/90">Next Chapter.</span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
                  Own fractional shares of premium real estate properties through blockchain tokenization on the Internet Computer Protocol.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 font-semibold px-8 py-4 text-lg shadow-lg">
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="ghost" className="text-white border-white/30 hover:bg-white/10 font-semibold px-8 py-4 text-lg">
                  ▶ See How It Works
                </Button>
              </div>
            </div>

            {/* Right Content - Building Image */}
            <div className="relative">
              <div className="relative z-10">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                  {/* Modern Building Structure */}
                  <defs>
                    <linearGradient id="buildingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="buildingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <linearGradient id="buildingGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>
                  
                  {/* Main building structure */}
                  <rect x="80" y="100" width="120" height="180" fill="url(#buildingGrad1)" rx="4" />
                  <rect x="200" y="80" width="100" height="200" fill="url(#buildingGrad2)" rx="4" />
                  <rect x="300" y="120" width="80" height="160" fill="url(#buildingGrad3)" rx="4" />
                  
                  {/* Building details - windows */}
                  <rect x="90" y="120" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="110" y="120" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="130" y="120" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="150" y="120" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="170" y="120" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  
                  {/* More windows */}
                  <rect x="90" y="150" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="110" y="150" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="130" y="150" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="150" y="150" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="170" y="150" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  
                  {/* Second building windows */}
                  <rect x="210" y="100" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="230" y="100" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="250" y="100" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="270" y="100" width="12" height="16" fill="#0ea5e9" opacity="0.7" rx="2" />
                  
                  {/* Third building windows */}
                  <rect x="310" y="140" width="10" height="14" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="325" y="140" width="10" height="14" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="340" y="140" width="10" height="14" fill="#0ea5e9" opacity="0.7" rx="2" />
                  <rect x="355" y="140" width="10" height="14" fill="#0ea5e9" opacity="0.7" rx="2" />
                  
                  {/* Balconies/terraces */}
                  <rect x="75" y="180" width="130" height="8" fill="url(#buildingGrad2)" />
                  <rect x="195" y="160" width="110" height="8" fill="url(#buildingGrad1)" />
                </svg>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
                <div className="text-white font-semibold">$2.4M</div>
                <div className="text-white/70 text-xs">Property Value</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-white">100k+</div>
                <div className="text-white/70 text-sm">Properties Tokenized</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-white">100+</div>
                <div className="text-white/70 text-sm">Active Investors</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-white">$50M+</div>
                <div className="text-white/70 text-sm">Total Value Locked</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-white">12.5%</div>
                <div className="text-white/70 text-sm">Average ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose RealtyChain?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Revolutionary blockchain technology meets traditional real estate investment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of investors building wealth through fractional real estate ownership
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Properties
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold gradient-text mb-4">RealtyChain</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                The future of real estate investment. Democratizing property ownership through blockchain technology and fractional investment opportunities.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/marketplace"><span className="hover:text-white transition-colors cursor-pointer">Marketplace</span></Link></li>
                <li><Link href="/dashboard"><span className="hover:text-white transition-colors cursor-pointer">Dashboard</span></Link></li>
                <li><Link href="/portfolio"><span className="hover:text-white transition-colors cursor-pointer">Portfolio</span></Link></li>
                <li><Link href="/governance"><span className="hover:text-white transition-colors cursor-pointer">Governance</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RealtyChain. All rights reserved. Built on Internet Computer Protocol.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
