import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Phone, 
  Clock, 
  MapPin,
  HelpCircle, 
  Shield, 
  FileText, 
  Search,
  Loader2,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { type ContactFormData } from "@/types/grants";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  privacyConsent: z.boolean().refine(val => val === true, "You must agree to the privacy policy"),
});

type ContactFormType = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      privacyConsent: false,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormType) => {
      const contactData: ContactFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        subject: data.subject,
        message: data.message,
      };

      const response = await apiRequest("POST", "/api/contact", contactData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
        variant: "default",
      });
      
      form.reset();
      (window as any).debugLog?.('Contact form submitted successfully', 'success');
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      
      (window as any).debugLog?.(`Contact form error: ${error.message}`, 'error');
    },
  });

  const onSubmit = (data: ContactFormType) => {
    contactMutation.mutate(data);
  };

  useEffect(() => {
    (window as any).debugLog?.('Navigated to contact page', 'info');
  }, []);

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      content: "support@oimf.org",
      action: () => window.open("mailto:support@oimf.org"),
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Phone",
      content: "+1 (555) 123-OIMF",
      action: () => window.open("tel:+15551234646"),
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Office Hours",
      content: "Mon-Fri: 9AM-6PM EST",
      action: null,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Global Offices",
      content: "14 Countries Worldwide",
      action: null,
    },
  ];

  const quickActions = [
    {
      icon: <HelpCircle className="h-4 w-4" />,
      title: "FAQ",
      description: "Frequently asked questions and answers",
      action: () => setShowFAQ(true),
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Privacy Policy",
      description: "How we protect your information",
      action: () => setShowPrivacy(true),
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Terms & Conditions",
      description: "Our terms of service",
      action: () => setShowTerms(true),
    },
    {
      icon: <Search className="h-4 w-4" />,
      title: "Application Status",
      description: "Check your grant application status",
      action: () => {
        toast({
          title: "Application Status",
          description: "Please login to view your application status in your dashboard.",
          variant: "default",
        });
      },
    },
  ];

  const faqs = [
    {
      question: "How do I know if I'm eligible for a grant?",
      answer: "Eligibility varies by grant program. Each grant listing includes specific criteria. Generally, you must be a resident of one of our 14 supported countries and meet the category-specific requirements."
    },
    {
      question: "Is there a fee to apply for grants?",
      answer: "No, OIMF never charges application fees. All grant opportunities are completely free to apply for. Be wary of any organization that asks for upfront fees."
    },
    {
      question: "How does the referral system work?",
      answer: "If someone in your family or friend circle has previously received an OIMF grant, you automatically qualify for consideration. Just enter their name in the referral field when applying."
    },
    {
      question: "How long does the application process take?",
      answer: "Applications are reviewed within 48 hours. If qualified, you'll be entered into our selection process. Final decisions are communicated within 7 business days."
    },
    {
      question: "Can I apply for multiple grants?",
      answer: "You can apply for grants in different categories, but only one application per grant program is allowed. We recommend choosing the grant that best fits your needs."
    },
    {
      question: "What countries do you operate in?",
      answer: "We currently operate in 14 countries: USA, UK, Canada, Australia, New Zealand, Germany, France, Japan, South Korea, Singapore, UAE, Netherlands, Sweden, and Norway."
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our support team - we're here to help!</p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <Card 
              key={index} 
              className={`text-center hover:shadow-lg transition-shadow ${
                info.action ? 'cursor-pointer hover:bg-blue-50' : ''
              }`}
              onClick={info.action || undefined}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-oimf-blue text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  {info.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-gray-600 text-sm">{info.content}</p>
                {info.action && (
                  <ExternalLink className="h-4 w-4 text-oimf-blue mx-auto mt-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="application-help">Application Help</SelectItem>
                              <SelectItem value="eligibility-question">Eligibility Question</SelectItem>
                              <SelectItem value="technical-issue">Technical Issue</SelectItem>
                              <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                              <SelectItem value="complaint">Complaint</SelectItem>
                              <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={5}
                              placeholder="Please provide as much detail as possible..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privacyConsent"
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
                              I agree to the privacy policy and terms of service
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-oimf-blue text-white hover:bg-blue-800 transition-colors font-semibold"
                      disabled={contactMutation.isPending}
                      size="lg"
                    >
                      {contactMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-oimf-blue mt-0.5">
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Support</h3>
                <p className="text-red-800 text-sm mb-4">
                  For urgent grant-related emergencies, please contact our 24/7 emergency line.
                </p>
                <Button 
                  onClick={() => window.open("tel:+15551234911")}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Line
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Modal Content */}
        {showFAQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <Button onClick={() => setShowFAQ(false)} variant="ghost" size="sm">
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Privacy Policy</CardTitle>
                  <Button onClick={() => setShowPrivacy(false)} variant="ghost" size="sm">
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    <strong>Last updated:</strong> August 13, 2024
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Information We Collect</h3>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    apply for grants, or contact us for support.
                  </p>

                  <h3 className="font-semibold text-gray-900">How We Use Your Information</h3>
                  <p>
                    We use the information we collect to provide, maintain, and improve our services, 
                    process grant applications, and communicate with you about your applications.
                  </p>

                  <h3 className="font-semibold text-gray-900">Information Sharing</h3>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except as described in this policy.
                  </p>

                  <h3 className="font-semibold text-gray-900">Data Security</h3>
                  <p>
                    We implement appropriate security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>

                  <h3 className="font-semibold text-gray-900">Contact Us</h3>
                  <p>
                    If you have questions about this Privacy Policy, please contact us at 
                    <a href="mailto:privacy@oimf.org" className="text-oimf-blue hover:underline ml-1">
                      privacy@oimf.org
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Terms & Conditions</CardTitle>
                  <Button onClick={() => setShowTerms(false)} variant="ghost" size="sm">
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    <strong>Last updated:</strong> August 13, 2024
                  </p>

                  <h3 className="font-semibold text-gray-900">Acceptance of Terms</h3>
                  <p>
                    By accessing and using this website, you accept and agree to be bound by the terms 
                    and provision of this agreement.
                  </p>

                  <h3 className="font-semibold text-gray-900">Grant Application Terms</h3>
                  <p>
                    All grant applications must be truthful and complete. False information may result 
                    in disqualification from current and future grant opportunities.
                  </p>

                  <h3 className="font-semibold text-gray-900">Selection Process</h3>
                  <p>
                    Grant recipients are selected through a fair and transparent process. Qualified 
                    applicants are randomly selected based on available funding and program criteria.
                  </p>

                  <h3 className="font-semibold text-gray-900">Use of Website</h3>
                  <p>
                    You may use our website for lawful purposes only. You agree not to use the website 
                    in any way that violates any applicable law or regulation.
                  </p>

                  <h3 className="font-semibold text-gray-900">Contact Information</h3>
                  <p>
                    For questions about these terms, please contact us at 
                    <a href="mailto:legal@oimf.org" className="text-oimf-blue hover:underline ml-1">
                      legal@oimf.org
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
