import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { insertApplicationSchema, type GrantWithCountry } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, DollarSign, Calendar, Users, CheckCircle, XCircle } from "lucide-react";

const applicationFormSchema = insertApplicationSchema.omit({ userId: true });
type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationModalProps {
  grant: GrantWithCountry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReferralCheckResult {
  exists: boolean;
  autoQualified: boolean;
}

export default function ApplicationModal({ grant, isOpen, onClose, onSuccess }: ApplicationModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [referralStatus, setReferralStatus] = useState<{
    checked: boolean;
    exists: boolean;
  } | null>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      grantId: grant.id,
      fullName: "",
      email: "",
      phone: "",
      address: "",
      reasonForApplying: "",
      referralName: "",
    },
  });

  const referralMutation = useMutation({
    mutationFn: async (referralName: string) => {
      return await apiRequest<ReferralCheckResult>('/api/check-referral', {
        method: 'POST',
        body: { referralName },
      });
    },
    onSuccess: (data) => {
      setReferralStatus({ checked: true, exists: data.exists });
      if (data.exists) {
        toast({
          title: "Referral Found!",
          description: "Your referral qualifies you for automatic approval.",
          variant: "default",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not check referral status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }
      return await apiRequest('/api/applications', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grants'] });
      
      toast({
        title: data.qualified ? "Application Successful!" : "Application Submitted",
        description: data.message,
        variant: data.qualified ? "default" : "destructive",
      });
      
      form.reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReferralCheck = () => {
    const referralName = form.getValues("referralName");
    if (referralName?.trim()) {
      referralMutation.mutate(referralName.trim());
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    applicationMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setReferralStatus(null);
    onClose();
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-oimf-blue">
            Apply for Grant
          </DialogTitle>
        </DialogHeader>

        {/* Grant Summary */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">{grant.title}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-oimf-blue" />
              {grant.countries?.name}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              {formatCurrency(grant.amount, grant.currency)}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-purple-600" />
              {grant.deadline 
                ? new Date(grant.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric', 
                    year: 'numeric'
                  })
                : "Rolling Deadline"
              }
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-orange-600" />
              {grant.availableSpots} spots available
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  className="mt-1"
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="mt-1"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  className="mt-1"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  className="mt-1"
                />
                {form.formState.errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Application Details</h4>
            <div>
              <Label htmlFor="reasonForApplying">Why are you applying for this grant? *</Label>
              <Textarea
                id="reasonForApplying"
                {...form.register("reasonForApplying")}
                className="mt-1"
                rows={4}
                placeholder="Please explain how this grant will help you and why you are a good candidate..."
              />
              {form.formState.errors.reasonForApplying && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.reasonForApplying.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Referral Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Referral (Optional)</h4>
            <p className="text-sm text-gray-600">
              If you have a family member or friend who has previously received a grant from OIMF, 
              enter their name for automatic qualification.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter referral's full name"
                  {...form.register("referralName")}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleReferralCheck}
                disabled={referralMutation.isPending || !form.watch("referralName")?.trim()}
              >
                {referralMutation.isPending ? "Checking..." : "Check"}
              </Button>
            </div>
            
            {referralStatus && (
              <div className={`flex items-center space-x-2 p-3 rounded ${
                referralStatus.exists ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {referralStatus.exists ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {referralStatus.exists 
                    ? "Referral found! You qualify for automatic approval." 
                    : "Referral not found. You'll be entered into random selection (70% approval rate)."
                  }
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Submit Section */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-oimf-blue hover:bg-oimf-blue/90"
              disabled={applicationMutation.isPending}
            >
              {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}