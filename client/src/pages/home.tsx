import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import { type ApplicationWithDetails, type GrantWithCountry } from "@shared/schema";
import { type GrantStats } from "@/types/grants";

export default function Home() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery<GrantStats>({
    queryKey: ['/api/stats'],
    retry: false,
  });

  const { data: applications = [] } = useQuery<ApplicationWithDetails[]>({
    queryKey: ['/api/applications'],
    retry: false,
  });

  const { data: grants = [] } = useQuery<GrantWithCountry[]>({
    queryKey: ['/api/grants'],
    retry: false,
  });

  const recentApplications = applications.slice(0, 3);
  const featuredGrants = grants.slice(0, 3);

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      under_review: 'text-blue-600 bg-blue-100',
      qualified: 'text-green-600 bg-green-100',
      not_qualified: 'text-red-600 bg-red-100',
      selected: 'text-purple-600 bg-purple-100',
      awarded: 'text-emerald-600 bg-emerald-100',
      rejected: 'text-gray-600 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your grant applications and discover new opportunities
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-oimf-gold" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Distributed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(stats.totalGrantsDistributed / 1000000000).toFixed(1)}B
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-oimf-blue" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recipients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats.totalRecipients / 1000).toFixed(0)}K+
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">My Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/applications">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-500 mb-4">Start by applying for your first grant</p>
                    <Button asChild>
                      <Link href="/grants">Browse Grants</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {application.grant.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatCurrency(application.grant.amount, application.grant.currency)} • {application.grant.country.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {new Date(application.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {formatStatus(application.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Featured Grants */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/grants">
                    <FileText className="mr-2 h-4 w-4" />
                    Browse All Grants
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/apply">
                    <Clock className="mr-2 h-4 w-4" />
                    Quick Apply
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/contact">
                    <Users className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Featured Grants */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Grants</CardTitle>
              </CardHeader>
              <CardContent>
                {featuredGrants.length === 0 ? (
                  <p className="text-gray-500 text-sm">No grants available</p>
                ) : (
                  <div className="space-y-4">
                    {featuredGrants.map((grant) => (
                      <div key={grant.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-oimf-blue text-white px-2 py-1 rounded-full">
                            {grant.country?.name}
                          </span>
                          <span className="text-sm font-bold text-oimf-gold">
                            {formatCurrency(grant.amount, grant.currency)}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {grant.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {grant.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {grant.availableSpots} spots left
                          </span>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/grants#${grant.id}`}>Apply</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
