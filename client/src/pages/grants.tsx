import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import GrantCard from "@/components/GrantCard";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { type GrantWithCountry, type Country } from "@shared/schema";
import { type GrantFilters } from "@/types/grants";

export default function Grants() {
  const [filters, setFilters] = useState<GrantFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
    retry: false,
  });

  const { data: allGrants = [], isLoading, refetch } = useQuery<GrantWithCountry[]>({
    queryKey: ['/api/grants'],
    retry: false,
  });

  // Filter grants based on search term and filters
  const filteredGrants = allGrants.filter(grant => {
    const matchesSearch = !searchTerm || 
      grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.country?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = !filters.country || grant.countryId === filters.country;
    const matchesCategory = !filters.category || grant.category === filters.category;
    
    const matchesAmount = !filters.amount || (() => {
      const amount = parseFloat(grant.amount);
      switch (filters.amount) {
        case 'under-10k': return amount < 10000;
        case '10k-50k': return amount >= 10000 && amount <= 50000;
        case '50k-100k': return amount >= 50000 && amount <= 100000;
        case 'over-100k': return amount > 100000;
        default: return true;
      }
    })();

    return matchesSearch && matchesCountry && matchesCategory && matchesAmount;
  });

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const hasActiveFilters = Object.values(filters).some(value => value) || searchTerm;

  useEffect(() => {
    // Log navigation for debugging
    (window as any).debugLog?.('Navigated to grants page', 'info');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Grant Opportunities</h1>
          <p className="text-xl text-gray-600">Discover funding opportunities tailored to your needs</p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search grants by title, description, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="md:w-auto"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-oimf-blue text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={filters.country || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.category || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="emergency">Emergency Relief</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.amount || ""} onValueChange={(value) => setFilters(prev => ({ ...prev, amount: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grant Amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Amount</SelectItem>
                      <SelectItem value="under-10k">Under $10,000</SelectItem>
                      <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="over-100k">Over $100,000</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1"
                      disabled={!hasActiveFilters}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {isLoading ? (
              "Loading grants..."
            ) : (
              `Showing ${filteredGrants.length} of ${allGrants.length} grants`
            )}
            {hasActiveFilters && (
              <span className="ml-2 text-oimf-blue font-medium">(filtered)</span>
            )}
          </p>
          
          {filteredGrants.length > 0 && (
            <div className="text-sm text-gray-500">
              Total funding available: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(
                filteredGrants.reduce((sum, grant) => sum + parseFloat(grant.amount), 0)
              )}
            </div>
          )}
        </div>

        {/* Grants Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGrants.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveFilters ? "No grants match your filters" : "No grants available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria to find more opportunities."
                  : "Check back later for new grant opportunities."
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGrants.map((grant) => (
              <GrantCard 
                key={grant.id} 
                grant={grant} 
                onApplicationSuccess={() => {
                  refetch();
                  (window as any).debugLog?.(`Application submitted for grant: ${grant.title}`, 'success');
                }}
              />
            ))}
          </div>
        )}

        {/* Load More (if needed for pagination in the future) */}
        {filteredGrants.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Showing all available grants. New opportunities are added regularly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
