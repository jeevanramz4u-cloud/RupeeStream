import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Target, Users, TrendingUp, Star, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const advertiserFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(150, "Company name is too long"),
  contactPerson: z.string().min(2, "Contact person name is required").max(100, "Name is too long"),
  email: z.string().email("Valid email is required").max(200, "Email is too long"),
  phone: z.string().min(10, "Valid phone number is required").max(15, "Phone number is too long").regex(/^[\d\s\-\+\(\)]{10,15}$/, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  industry: z.string().min(1, "Please select an industry"),
  campaignBudget: z.string().min(1, "Please select a budget range"),
  taskTypes: z.array(z.string()).min(1, "Please select at least one task type").max(6, "Too many task types selected"),
  campaignObjective: z.string().min(20, "Please provide more details about your campaign objective (minimum 20 characters)").max(1000, "Campaign objective is too long"),
  targetAudience: z.string().min(20, "Please provide more details about your target audience (minimum 20 characters)").max(1000, "Target audience description is too long"),
  campaignDuration: z.string().min(1, "Please select campaign duration"),
  additionalRequirements: z.string().max(1500, "Additional requirements are too long").optional(),
});

type AdvertiserFormData = z.infer<typeof advertiserFormSchema>;

export default function Advertisers() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdvertiserFormData>({
    resolver: zodResolver(advertiserFormSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      campaignBudget: "",
      taskTypes: [],
      campaignObjective: "",
      targetAudience: "",
      campaignDuration: "",
      additionalRequirements: "",
    },
  });

  const submitInquiryMutation = useMutation({
    mutationFn: (data: AdvertiserFormData) =>
      apiRequest("POST", "/api/advertiser-inquiry", data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Inquiry Submitted Successfully!",
        description: "Our team will contact you shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdvertiserFormData) => {
    submitInquiryMutation.mutate(data);
  };

  const taskTypes = [
    { id: "app_downloads", label: "App Downloads & Installations" },
    { id: "business_reviews", label: "Business Reviews & Ratings" },
    { id: "product_reviews", label: "Product Reviews & Feedback" },
    { id: "channel_subscribe", label: "Channel Subscriptions" },
    { id: "comments_likes", label: "Comments & Social Engagement" },
    { id: "video_views", label: "YouTube Video Views" },
  ];

  const industries = [
    "Technology & Software",
    "E-commerce & Retail", 
    "Education & Training",
    "Healthcare & Medical",
    "Food & Beverage",
    "Travel & Tourism",
    "Finance & Banking",
    "Real Estate",
    "Entertainment & Media",
    "Fashion & Beauty",
    "Automotive",
    "Other",
  ];

  const budgetRanges = [
    "₹10,000 - ₹50,000",
    "₹50,000 - ₹1,00,000", 
    "₹1,00,000 - ₹5,00,000",
    "₹5,00,000 - ₹10,00,000",
    "₹10,00,000+",
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 safe-area-padding">
        <Header />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-6">
                Your advertising inquiry has been submitted successfully. Our team will contact you within 24 hours to discuss your campaign requirements.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full"
                  data-testid="button-back-home"
                >
                  Continue Browsing
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Start Advertising With Us
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Reach thousands of active users and grow your business with our targeted task completion platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Benefits Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Why Choose Us?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-medium">Active User Base</h3>
                    <p className="text-sm text-gray-600">10,000+ verified users ready to complete tasks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-medium">High Quality Results</h3>
                    <p className="text-sm text-gray-600">KYC verified users with quality assurance</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-medium">Quick Execution</h3>
                    <p className="text-sm text-gray-600">Campaign launch within 24-48 hours</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Our Task Types</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {taskTypes.map((task) => (
                      <li key={task.id}>
                        <span>{task.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Inquiry Form</CardTitle>
                <p className="text-gray-600">Tell us about your advertising goals and requirements</p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Company Information</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company name" {...field} data-testid="input-company-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactPerson"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} data-testid="input-contact-person" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="contact@company.com" {...field} data-testid="input-email" />
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
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 9876543210" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://yourwebsite.com" {...field} data-testid="input-website" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-industry">
                                    <SelectValue placeholder="Select your industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {industries.map((industry) => (
                                    <SelectItem key={industry} value={industry}>
                                      {industry}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Campaign Details</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="campaignBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Budget *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-budget">
                                    <SelectValue placeholder="Select budget range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {budgetRanges.map((budget) => (
                                    <SelectItem key={budget} value={budget}>
                                      {budget}
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
                          name="campaignDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Duration *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-duration">
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-week">1 Week</SelectItem>
                                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                                  <SelectItem value="1-month">1 Month</SelectItem>
                                  <SelectItem value="2-months">2 Months</SelectItem>
                                  <SelectItem value="3-months">3 Months</SelectItem>
                                  <SelectItem value="6-months">6 Months</SelectItem>
                                  <SelectItem value="ongoing">Ongoing Campaign</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="taskTypes"
                        render={() => (
                          <FormItem>
                            <FormLabel>Task Types Required *</FormLabel>
                            <div className="grid md:grid-cols-2 gap-3 mt-2">
                              {taskTypes.map((task) => (
                                <FormField
                                  key={task.id}
                                  control={form.control}
                                  name="taskTypes"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(task.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, task.id])
                                              : field.onChange(field.value?.filter((value) => value !== task.id));
                                          }}
                                          data-testid={`checkbox-${task.id}`}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="font-normal">
                                          {task.label}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaignObjective"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Objective *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your campaign goals, what you want to achieve, and success metrics..."
                                className="min-h-[100px]"
                                {...field}
                                data-testid="textarea-objective"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your target audience: demographics, interests, location, behavior..."
                                className="min-h-[100px]"
                                {...field}
                                data-testid="textarea-audience"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Requirements</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any specific requirements, guidelines, or additional information about your campaign..."
                                className="min-h-[80px]"
                                {...field}
                                data-testid="textarea-requirements"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitInquiryMutation.isPending}
                        className="min-w-[200px]"
                        data-testid="button-submit-inquiry"
                      >
                        {submitInquiryMutation.isPending ? (
                          "Submitting..."
                        ) : (
                          <>
                            Submit Inquiry
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}