import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, FileText, Users, DollarSign, Globe, Shield, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { type GrantStats } from "@/types/grants";

export default function Landing() {
  const { data: stats } = useQuery<GrantStats>({
    queryKey: ['/api/stats'],
    retry: false,
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const countries = [
    { code: 'USA', flag: '🇺🇸', name: 'USA' },
    { code: 'UK', flag: '🇬🇧', name: 'UK' },
    { code: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
    { code: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: 'FR', flag: '🇫🇷', name: 'France' },
    { code: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
    { code: 'AE', flag: '🇦🇪', name: 'UAE' },
    { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
    { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
    { code: 'NO', flag: '🇳🇴', name: 'Norway' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative oimf-gradient text-white py-20 overflow-hidden">
        <div className="absolute inset-0 hero-overlay"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            International Grant <span className="text-oimf-light-gold">Opportunities</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
            The Oldies International Monetary Foundation connects eligible individuals with life-changing grant opportunities across 14 countries. Join thousands who have already received funding.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={() => scrollToSection('grants')}
              className="bg-oimf-gold hover:bg-oimf-light-gold text-gray-900 px-8 py-4 text-lg font-semibold"
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Find Your Grant
            </Button>
            <Button 
              asChild
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-oimf-blue px-8 py-4 text-lg font-semibold"
              size="lg"
            >
              <a href="/api/login">
                <FileText className="mr-2 h-5 w-5" />
                Apply Now
              </a>
            </Button>
          </div>

          {/* Stats Section */}
          {stats && (
            <div className="stats-grid max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-oimf-light-gold">
                  ${(stats.totalGrantsDistributed / 1000000000).toFixed(1)}B
                </div>
                <div className="text-sm md:text-base opacity-90">Grants Distributed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-oimf-light-gold">
                  {(stats.totalRecipients / 1000).toFixed(0)}K+
                </div>
                <div className="text-sm md:text-base opacity-90">Recipients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-oimf-light-gold">
                  {stats.totalCountries}
                </div>
                <div className="text-sm md:text-base opacity-90">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-oimf-light-gold">
                  {stats.successRate}%
                </div>
                <div className="text-sm md:text-base opacity-90">Success Rate</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Countries Section */}
      <section id="countries" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available in 14 Countries</h2>
            <p className="text-xl text-gray-600">OIMF operates internationally, providing grant opportunities across major economies</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {countries.map((country) => (
              <div 
                key={country.code}
                className="text-center p-4 bg-slate-50 rounded-lg hover:bg-oimf-blue hover:text-white transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-2">{country.flag}</div>
                <div className="font-semibold text-sm">{country.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-xl text-gray-600">Simple steps to secure your grant funding</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-oimf-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Check Eligibility</h3>
                <p className="text-gray-600">
                  Review grant requirements and verify your eligibility. Our system checks for family/friend referrals that automatically qualify you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-oimf-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Submit Application</h3>
                <p className="text-gray-600">
                  Complete our streamlined application form with required documents. All submissions are processed within 48 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-oimf-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Selected</h3>
                <p className="text-gray-600">
                  Recipients are randomly selected from qualified applicants. Notification is sent within 7 business days of selection.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Automatic Qualification Banner */}
          <Card className="mt-12 oimf-gold-gradient text-gray-900">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Automatic Qualification</h3>
                <p className="text-lg mb-6">
                  If any of your friends, family members, or relatives have received a grant through OIMF, you automatically qualify for our selection process!
                </p>
                <Button 
                  asChild
                  className="bg-white text-oimf-blue hover:bg-gray-100"
                >
                  <a href="/api/login">
                    <Users className="mr-2 h-5 w-5" />
                    Check Referral Status
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Diverse group celebrating success" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About OIMF</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                The Oldies International Monetary Foundation was established in 2015 with a mission to provide equitable access to grant opportunities for individuals and organizations worldwide. We believe that financial barriers should not prevent people from achieving their dreams and contributing to society.
              </p>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Our unique approach combines traditional grant administration with innovative referral systems, ensuring that success spreads through communities and families. With operations in 14 countries, we've distributed over $2.8 billion in grants to deserving recipients.
              </p>
              <ul className="space-y-3">
                {[
                  'Transparent selection process',
                  'No application fees ever',
                  'Family referral benefits',
                  'International reach'
                ].map((item) => (
                  <li key={item} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3 h-5 w-5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 oimf-gradient text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Ready to Apply for a Grant?</h2>
          <p className="text-xl mb-8">Join thousands of successful grant recipients worldwide</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-oimf-gold hover:bg-oimf-light-gold text-gray-900 font-semibold"
            >
              <a href="/api/login">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-oimf-blue font-semibold"
            >
              <Link href="/contact">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
