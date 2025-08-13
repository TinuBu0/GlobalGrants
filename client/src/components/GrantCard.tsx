import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, MapPin } from "lucide-react";
import { type GrantWithCountry } from "@shared/schema";
import { useState } from "react";
import ApplicationModal from "./ApplicationModal";

interface GrantCardProps {
  grant: GrantWithCountry;
  onApplicationSuccess?: () => void;
}

export default function GrantCard({ grant, onApplicationSuccess }: GrantCardProps) {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const progressPercentage = ((grant.totalSpots - grant.availableSpots) / grant.totalSpots) * 100;
  
  const formatAmount = (grant: GrantWithCountry) => {
    if (grant.amountType === 'range' && grant.minAmount && grant.maxAmount) {
      const min = parseFloat(grant.minAmount);
      const max = parseFloat(grant.maxAmount);
      const formatNum = (num: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: grant.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
      return `${formatNum(min)} - ${formatNum(max)}`;
    } else if (grant.amount) {
      const num = parseFloat(grant.amount);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: grant.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } else {
      return 'Amount varies';
    }
  };

  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return "Rolling Deadline";
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      education: 'bg-blue-500',
      business: 'bg-green-500', 
      healthcare: 'bg-red-500',
      housing: 'bg-purple-500',
      emergency: 'bg-orange-500',
      seniors: 'bg-indigo-500',
      research: 'bg-pink-500',
      innovation: 'bg-teal-500',
      homebuyer: 'bg-violet-500',
      financial_relief: 'bg-amber-500',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getProgressColor = () => {
    if (progressPercentage < 30) return 'bg-blue-500';
    if (progressPercentage < 60) return 'bg-yellow-500';
    if (progressPercentage < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <>
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {grant.countries?.flag} {grant.countries?.code}
              </span>
              <span className={`${getCategoryColor(grant.category)} text-white px-2 py-1 rounded text-xs font-medium capitalize`}>
                {grant.category.replace('_', ' ')}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">
                {formatAmount(grant)}
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
            {grant.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {grant.description}
          </p>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Deadline: {formatDeadline(grant.deadline)}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>{grant.availableSpots} spots</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Applications processed</span>
                <span className="font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-gray-800 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowApplicationModal(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors"
            disabled={grant.availableSpots === 0}
          >
            {grant.availableSpots === 0 ? 'No Spots Available' : 'Apply Now'}
          </Button>
        </CardContent>
      </Card>

      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        grant={grant}
        onSuccess={() => {
          setShowApplicationModal(false);
          onApplicationSuccess?.();
        }}
      />
    </>
  );
}
