import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Loader2, FileText, Users, CheckCircle, Search, AlertCircle } from "lucide-react";
import { type GrantWithCountry, type Country } from "@shared/schema";
import { type GrantApplicationData } from "@/types/grants";

const applicationSchema = z.object({
  grantId: z.string().min(1, "Please select a grant"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  category: z.string().min(1, "Category is required"),
  situation: z.string().min(10, "Please provide more details about your situation"),
  referralName: z.string().optional(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function Apply() {
  const { toast } = useToast();
  const [selectedGrant, setSelectedGrant] = useState<GrantWithCountry | null>(null);
  const [referralChecked, setReferralChecked] = useState(false);
  const [referralExists, setReferralExists] = useState(false);

  const { data: grants = [] } = useQuery<GrantWithCountry[]>({
    queryKey: ['/api/grants'],
    retry: false,
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
    retry: false,
  });

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      grantId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      category: "",
      situation: "",
      referralName: "",
      terms: false,
    },
  });

  const referralCheckMutation = useMutation({
    mutationFn: async (referralName: string) => {
      const response = await apiRequest("POST", "/api/check-referral", { referralName });
      return response.json();
    },
    onSuccess: (data) => {
      setReferralExists(data.exists);
      setReferralChecked(true);
      
      if (data.exists) {
        toast({
          title: "Referral Found!",
          description: "You automatically qualify for selection.",
          variant: "default",
        });
      } else {
        toast({
          title: "Referral Not Found",
          description: "No matching referral found, but you can still apply.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to check referral status",
        variant: "destructive",
      });
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.qualified ? "Application Submitted!" : "Application Submitted",
        description: data.message,
        variant: data.qualified ? "default" : "destructive",
      });

      if (data.qualified) {
        form.reset();
        setSelectedGrant(null);
        setReferralChecked(false);
        setReferralExists(false);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const watchedGrantId = form.watch("grantId");

  useEffect(() => {
    const grant = grants.find(g => g.id === watchedGrantId);
    setSelectedGrant(grant || null);
    
    if (grant) {
      form.setValue("country", grant.countryId);
      form.setValue("category", grant.category);
    }
  }, [watchedGrantId, grants, form]);

  useEffect(() => {
    (window as any).debugLog?.('Navigated to apply page', 'info');
  }, []);

  const checkReferral = () => {
    const referralName = form.getValues("referralName");
    if (referralName && referralName.trim()) {
      referralCheckMutation.mutate(referralName);
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    (window as any).debugLog?.(`Submitting application for grant: ${selectedGrant?.title}`, 'info');
    applicationMutation.mutate(data);
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Apply for a Grant</h1>
          <p className="text-xl text-gray-600">Submit your application for funding opportunities</p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Users className="h-8 w-8 text-green-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Automatic Qualification</h3>
                <p className="text-green-800 mb-3">
                  If any of your friends, family members, or relatives have received a grant through OIMF, 
                  you automatically qualify for our selection process!
                </p>
                <p className="text-sm text-green-700">
                  Make sure to enter their name in the referral field below to get instant qualification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Grant Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Grant Selection */}
                <FormField
                  control={form.control}
                  name="grantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Grant</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a grant to apply for" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grants.map((grant) => (
                            <SelectItem key={grant.id} value={grant.id}>
                              {grant.title} - {formatCurrency(grant.amount, grant.currency)} ({grant.country?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selected Grant Info */}
                {selectedGrant && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">{selectedGrant.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Amount: </span>
                          <span className="text-blue-900">{formatCurrency(selectedGrant.amount, selectedGrant.currency)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Country: </span>
                          <span className="text-blue-900">{selectedGrant.country?.name}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Available: </span>
                          <span className="text-blue-900">{selectedGrant.availableSpots} spots</span>
                        </div>
                      </div>
                      <p className="text-blue-800 mt-2 text-sm">{selectedGrant.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grant Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="housing">Housing</SelectItem>
                            <SelectItem value="emergency">Emergency Relief</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Referral Section */}
                <FormField
                  control={form.control}
                  name="referralName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family/Friend Reference (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            {...field} 
                            placeholder="Name of family member or friend who received a grant"
                          />
                          <Button
                            type="button"
                            onClick={checkReferral}
                            disabled={!field.value || referralCheckMutation.isPending}
                            variant="outline"
                          >
                            {referralCheckMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      
                      {referralChecked && (
                        <div className={`flex items-center mt-2 text-sm ${
                          referralExists ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {referralExists ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Referral found! You automatically qualify.
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              No referral found, but you can still apply.
                            </>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-green-600">
                        Having a family/friend reference automatically qualifies you!
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tell us about your situation</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder="Describe your current situation and how this grant would help you..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the terms and conditions and privacy policy
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-oimf-gold text-gray-900 hover:bg-oimf-light-gold transition-colors font-semibold"
                  disabled={applicationMutation.isPending}
                  size="lg"
                >
                  {applicationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Application...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-oimf-blue text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">Submit Application</h4>
                <p className="text-sm text-gray-600">Complete the form and submit your application</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-oimf-blue text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">Review Process</h4>
                <p className="text-sm text-gray-600">Applications are reviewed within 48 hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-oimf-blue text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Selection & Award</h4>
                <p className="text-sm text-gray-600">Random selection from qualified applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
