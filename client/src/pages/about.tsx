import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Globe, DollarSign, Award, Shield, Heart, Target } from "lucide-react";
import { Link } from "wouter";
import { type GrantStats } from "@/types/grants";

export default function About() {
  const { data: stats } = useQuery<GrantStats>({
    queryKey: ['/api/stats'],
    retry: false,
  });

  useEffect(() => {
    (window as any).debugLog?.('Navigated to about page', 'info');
  }, []);

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-oimf-blue" />,
      title: "Transparent Selection Process",
      description: "Our grant selection process is completely transparent and fair, with clear criteria and random selection for qualified applicants."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      title: "No Application Fees",
      description: "We never charge application fees. All our grant opportunities are completely free to apply for."
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Family Referral Benefits",
      description: "If someone in your family or friends circle has received a grant, you automatically qualify for consideration."
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      title: "International Reach",
      description: "Operating in 14 countries across North America, Europe, Asia, and Oceania with localized support."
    },
    {
      icon: <Target className="h-6 w-6 text-red-500" />,
      title: "Diverse Categories",
      description: "Grants available for education, business, healthcare, housing, and emergency relief across all age groups."
    },
    {
      icon: <Heart className="h-6 w-6 text-pink-500" />,
      title: "Community Impact",
      description: "Every grant we award creates a ripple effect of positive change in communities worldwide."
    }
  ];

  const milestones = [
    {
      year: "2015",
      title: "Foundation Established",
      description: "OIMF was founded with a mission to democratize access to funding opportunities worldwide."
    },
    {
      year: "2017",
      title: "International Expansion",
      description: "Expanded operations to 5 countries, establishing our first international offices."
    },
    {
      year: "2019",
      title: "Digital Platform Launch",
      description: "Launched our comprehensive online platform, making applications faster and more accessible."
    },
    {
      year: "2021",
      title: "Referral System Innovation",
      description: "Introduced the family/friend referral system, creating automatic qualification pathways."
    },
    {
      year: "2023",
      title: "Global Reach Achievement",
      description: "Achieved operations in 14 countries with over 150,000 grant recipients worldwide."
    },
    {
      year: "2024",
      title: "Continued Growth",
      description: "Surpassed $2.8 billion in total grants distributed, maintaining our commitment to transparency."
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Margaret Chen",
      role: "Executive Director",
      description: "Former World Bank economist with 20+ years in international development and grant management."
    },
    {
      name: "James Robertson",
      role: "Head of Operations",
      description: "Oversees grant distribution across all 14 countries with expertise in cross-border financial systems."
    },
    {
      name: "Sofia Martinez",
      role: "Technology Director",
      description: "Leads our digital transformation initiatives, ensuring accessible and secure grant applications."
    },
    {
      name: "Dr. Raj Patel",
      role: "Research & Analytics",
      description: "Data scientist specializing in fair selection algorithms and impact measurement."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="oimf-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About OIMF</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              The Oldies International Monetary Foundation was established in 2015 with a mission to provide 
              equitable access to grant opportunities for individuals and organizations worldwide.
            </p>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-oimf-light-gold">
                    ${(stats.totalGrantsDistributed / 1000000000).toFixed(1)}B
                  </div>
                  <div className="text-sm md:text-base opacity-90">Total Distributed</div>
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
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                We believe that financial barriers should not prevent people from achieving their dreams and 
                contributing to society. Our mission is to create a more equitable world where funding 
                opportunities are accessible to everyone, regardless of their background or location.
              </p>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Through our unique approach that combines traditional grant administration with innovative 
                referral systems, we ensure that success spreads through communities and families, creating 
                lasting positive impact across generations.
              </p>
              <ul className="space-y-3">
                {[
                  'Democratize access to funding worldwide',
                  'Support sustainable community development',
                  'Foster innovation and entrepreneurship',
                  'Eliminate barriers to financial assistance'
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

      {/* Key Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
            <p className="text-xl text-gray-600">Our commitment to transparency, accessibility, and community impact</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our mission to democratize funding</p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-oimf-blue"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  <div className={`flex-1 ${
                    index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                  }`}>
                    <Card className="ml-12 md:ml-0">
                      <CardContent className="p-6">
                        <div className="text-oimf-gold font-bold text-lg mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-oimf-blue rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals driving our mission forward</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-oimf-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-oimf-blue font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 oimf-gradient text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Award className="mx-auto h-16 w-16 mb-6" />
          <h2 className="text-3xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8">
            Become part of a global network of grant recipients and make your impact on the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-oimf-gold hover:bg-oimf-light-gold text-gray-900 font-semibold"
            >
              <Link href="/grants">
                Explore Grants
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-oimf-blue font-semibold"
            >
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
