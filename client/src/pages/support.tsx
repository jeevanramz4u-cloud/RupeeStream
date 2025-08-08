import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle,
  Clock,
  Users,
  Shield,
  Wallet,
  CheckCircle,
  Coins,
  Play,
  HeadphonesIcon,
  ArrowRight,
  Star,
  Zap
} from "lucide-react";

export default function Support() {
  const faqItems = [
    {
      question: "What bonuses do I get when signing up?",
      answer: "You receive a ₹1,000 signup bonus when you create your account and complete the registration process. This bonus is credited to your account immediately after successful signup.",
      icon: <Coins className="w-4 h-4 text-green-600" />
    },
    {
      question: "How do I earn money on EarnPay?",
      answer: "You earn money by watching videos completely without skipping or fast-forwarding. Each video has a specific earning amount that gets credited to your account once you finish watching it. Additionally, you earn ₹10 every hour as a login bonus just for being active on the platform.",
      icon: <Play className="w-4 h-4 text-blue-600" />
    },
    {
      question: "What is the hourly login bonus?",
      answer: "You earn ₹10 every hour simply by logging into your account and staying active on the platform. This bonus is automatically credited to your account for each hour you remain logged in.",
      icon: <Clock className="w-4 h-4 text-purple-600" />
    },
    {
      question: "What fees are required on the platform?",
      answer: "There are two required fees: (1) ₹99 KYC processing fee - mandatory for document verification and to access payout features, and (2) ₹49 account reactivation fee - required if your account gets suspended for not meeting daily watch time targets for 3 consecutive days.",
      icon: <Wallet className="w-4 h-4 text-orange-600" />
    },
    {
      question: "What is the daily target requirement?",
      answer: "You must watch videos for a minimum of 8 hours daily to maintain your account in good standing. Failing to meet this requirement for 3 consecutive days may result in account suspension, which requires a ₹49 reactivation fee.",
      icon: <Shield className="w-4 h-4 text-red-600" />
    },
    {
      question: "How does the referral program work?",
      answer: "Share your unique referral code with friends. When they sign up and complete their KYC verification, you earn ₹49. There's no limit to how many people you can refer.",
      icon: <Users className="w-4 h-4 text-indigo-600" />
    },
    {
      question: "When do I get paid?",
      answer: "Payouts are processed weekly on Tuesdays. You can request a payout anytime after completing KYC verification, and it will be included in the next weekly batch.",
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />
    },
    {
      question: "What verification documents do I need?",
      answer: "You need to upload a government-issued ID (Aadhaar, Passport, or Driver's License) and provide your bank account details for verification and payouts. A ₹99 processing fee is required to complete the KYC verification.",
      icon: <Shield className="w-4 h-4 text-blue-600" />
    },
    {
      question: "Can I skip or fast-forward videos?",
      answer: "No, you cannot skip, fast-forward, or rewind videos. You must watch the complete video from start to finish to earn money.",
      icon: <Play className="w-4 h-4 text-red-600" />
    },
    {
      question: "How long does verification take?",
      answer: "Account verification typically takes 24-48 hours after payment of the ₹99 processing fee. Our admin team reviews all submitted documents manually to ensure security.",
      icon: <Clock className="w-4 h-4 text-blue-600" />
    },
    {
      question: "What happens if I don't meet the daily target?",
      answer: "If you fail to meet the 8-hour daily target for 3 consecutive days, your account will be suspended. To reactivate it, you'll need to pay a ₹49 reactivation fee.",
      icon: <Shield className="w-4 h-4 text-orange-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 safe-area-padding">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <HeadphonesIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">Professional Support</h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
                Expert assistance for your EarnPay business operations and account management
              </p>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <CardContent className="relative pt-6 pb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Live Chat Support</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Get instant professional assistance from our expert support team via live chat
              </p>
              <div className="bg-blue-100 text-blue-800 text-xs px-3 py-2 rounded-full font-semibold mb-3">
                ⚡ Available 24/7
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold">
                Start Live Chat
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardContent className="relative pt-6 pb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Send us detailed inquiries for comprehensive account assistance and technical help
              </p>
              <div className="bg-green-100 text-green-800 text-xs px-3 py-2 rounded-full font-semibold mb-3">
                📧 Professional Support
              </div>
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 font-semibold">
                <Mail className="w-4 h-4 mr-2" />
                support@earnpay.com
              </Button>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardContent className="relative pt-6 pb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Priority Phone Support</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Call our dedicated support line for urgent issues and immediate account assistance
              </p>
              <div className="bg-purple-100 text-purple-800 text-xs px-3 py-2 rounded-full font-semibold mb-3">
                🔥 Urgent Issues
              </div>
              <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold">
                <Phone className="w-4 h-4 mr-2" />
                +91-XXXX-XXXX
              </Button>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Help Topics */}
        <Card className="mb-6 sm:mb-8 border border-gray-100 shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Quick Help Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Earnings & Payouts</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Questions about earnings tracking, payout schedules, and withdrawal processes</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Account Verification</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Help with KYC document upload, verification status, and approval process</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Referral Program</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Questions about referral codes, bonuses, and tracking referred users</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Daily Targets</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Help with 8-hour daily requirements, suspension, and reactivation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section - Redesigned to match landing page */}
        <section className="py-8 sm:py-12 px-6 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 relative overflow-hidden rounded-3xl border border-gray-100 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Find answers to common questions about EarnPay platform features and operations
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2"
                  >
                    <AccordionTrigger className="text-left hover:no-underline group py-4">
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {faq.icon}
                        </div>
                        <span className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 ml-11 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Support Hours */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-8 text-center">
              <div>
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-600">24/7 Available</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-600">Response within 24 hours</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-600">Mon-Fri 9 AM - 6 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
