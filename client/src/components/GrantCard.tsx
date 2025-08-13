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
      <Card className="hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-oimf-blue text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <span className="mr-1">{grant.countries?.flag}</span>
                {grant.countries?.name}
              </span>
              <span className={`${getCategoryColor(grant.category)} text-white px-2 py-1 rounded text-xs capitalize`}>
                {grant.category.replace('_', ' ')}
              </span>
            </div>
            <span className="text-oimf-gold font-bold text-lg">
              {formatAmount(grant)}
            </span>
          </div>
          
          <h4 className="text-xl font-bold text-gray-900 mb-3">{grant.title}</h4>
          <p className="text-gray-600 mb-4 line-clamp-3">{grant.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Deadline: {formatDeadline(grant.deadline)}
            </span>
            <span className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {grant.availableSpots} spots
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Applications processed</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          </div>
          
          <Button 
            onClick={() => setShowApplicationModal(true)}
            className="w-full bg-oimf-gold text-gray-900 hover:bg-oimf-light-gold transition-colors font-semibold"
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
