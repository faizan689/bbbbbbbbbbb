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
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Fractional Real Estate
              <br />
              <span className="text-accent">Investment Platform</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Invest in premium real estate with blockchain-powered fractional ownership. 
              Build your portfolio with as little as $100.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-gray-500
                hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-primary">$2.4B+</div>
              <div className="text-gray-600 dark:text-gray-300">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-secondary">15,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-accent">12.4%</div>
              <div className="text-gray-600 dark:text-gray-300">Avg. Annual Return</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-purple-600">850+</div>
              <div className="text-gray-600 dark:text-gray-300">Properties</div>
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
