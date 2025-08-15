import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageSquare, HeadphonesIcon, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Valid email is required").max(200, "Email is too long"),
  phone: z.string().optional().refine((val) => !val || /^[\d\s\-\+\(\)]{10,15}$/.test(val), "Please enter a valid phone number"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      apiRequest("POST", "/api/contact-inquiry", data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly via email.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitContactMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 safe-area-padding">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-6">
                Your message has been sent successfully. Our support team will respond within 24 hours.
              </p>
              <Button 
                onClick={() => window.location.href = "/"}
                className="w-full"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about Innovative Task Earn? We're here to help. Reach out to our support team for assistance with your account, payments, or any other inquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeadphonesIcon className="w-5 h-5 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-gray-600">support@innovativetaskearn.online</p>
                    <p className="text-xs text-gray-500">24/7 email support</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-gray-600">+91-8000-XXX-XXX</p>
                    <p className="text-xs text-gray-500">Mon-Fri: 9 AM - 6 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Office Address</h3>
                    <p className="text-sm text-gray-600">
                      INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED<br />
                      C/O YOGESH, Kharbla 99<br />
                      VATS STREET, KHARBLA<br />
                      Hisar, Haryana - 125042<br />
                      India
                    </p>
                    <p className="text-xs text-gray-500 mt-1">GST: 06AAGCI9044P1ZZ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Business Hours</h3>
                    <p className="text-sm text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                      Saturday: 10:00 AM - 4:00 PM IST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Common Topics:</h4>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-left h-auto p-2">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="text-sm">Account & Login Issues</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-left h-auto p-2">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="text-sm">Payment & Earnings</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-left h-auto p-2">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="text-sm">KYC Verification</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-left h-auto p-2">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="text-sm">Technical Support</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-sm text-gray-600">
                  Fill out the form below and our support team will get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email address" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="inquiryType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="support">Account & Login</SelectItem>
                                <SelectItem value="business">Payment & Earnings</SelectItem>
                                <SelectItem value="complaint">KYC Verification</SelectItem>
                                <SelectItem value="suggestion">Technical Support</SelectItem>
                              </SelectContent>
                            </Select>
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
                              <Input placeholder="+91 9876543210 (Optional)" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of your inquiry" {...field} data-testid="input-subject" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your issue or question in detail..."
                              className="min-h-32"
                              {...field}
                              data-testid="textarea-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Before contacting support:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check your account dashboard for any pending actions</li>
                        <li>• Ensure your email address is verified</li>
                        <li>• Have your user ID or email ready for faster assistance</li>
                        <li>• Include screenshots if reporting a technical issue</li>
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={submitContactMutation.isPending}
                        className="min-w-32"
                        data-testid="button-submit-contact"
                      >
                        {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Response Time */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Expected Response Times</h3>
              <div className="grid sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="font-medium text-green-600">High Priority</div>
                  <div className="text-gray-600">Account locked, payment issues</div>
                  <div className="font-medium">Within 2 hours</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">Medium Priority</div>
                  <div className="text-gray-600">KYC, technical issues</div>
                  <div className="font-medium">Within 12 hours</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">General Inquiry</div>
                  <div className="text-gray-600">Questions, feedback</div>
                  <div className="font-medium">Within 24 hours</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}