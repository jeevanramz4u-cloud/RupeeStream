import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  Coins, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Calendar,
  CreditCard,
  Users,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

export default function HowToEarn() {
  const steps = [
    {
      number: 1,
      title: "Sign Up & Verify",
      description: "Create your account and complete email verification",
      icon: <Shield className="w-6 h-6" />,
      details: [
        "Register with valid email address",
        "Verify your email within 24 hours",
        "Complete basic profile information",
        "Accept terms and conditions"
      ]
    },
    {
      number: 2,
      title: "Complete KYC",
      description: "Submit documents and pay ₹99 processing fee",
      icon: <CreditCard className="w-6 h-6" />,
      details: [
        "Upload government-issued ID",
        "Provide address proof document",
        "Submit clear selfie for verification",
        "Pay one-time ₹99 KYC processing fee"
      ]
    },
    {
      number: 3,
      title: "Start Watching Videos",
      description: "Watch videos completely to earn money",
      icon: <Play className="w-6 h-6" />,
      details: [
        "Browse available video catalog",
        "Select videos you want to watch",
        "Watch videos completely (no skipping)",
        "Earn money immediately upon completion"
      ]
    },
    {
      number: 4,
      title: "Meet Daily Targets",
      description: "Watch 8 hours daily to maintain account status",
      icon: <Target className="w-6 h-6" />,
      details: [
        "Complete minimum 8 hours daily",
        "Track progress in real-time",
        "Maintain consistency for best results",
        "Avoid account suspension"
      ]
    },
    {
      number: 5,
      title: "Get Weekly Payouts",
      description: "Receive earnings every Tuesday",
      icon: <Calendar className="w-6 h-6" />,
      details: [
        "Automatic payout processing",
        "Payments sent every Tuesday",
        "Direct bank transfer",
        "Instant payout notifications"
      ]
    }
  ];

  const earningRules = [
    {
      title: "Complete Video Viewing",
      description: "Videos must be watched from start to finish without skipping or fast-forwarding",
      icon: <Play className="w-5 h-5 text-blue-600" />,
      type: "requirement"
    },
    {
      title: "Daily Watch Time Target",
      description: "Minimum 8 hours of video watching required per day to maintain active status",
      icon: <Clock className="w-5 h-5 text-green-600" />,
      type: "requirement"
    },
    {
      title: "KYC Verification Required",
      description: "Complete KYC verification and pay ₹99 processing fee to unlock payout features",
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      type: "requirement"
    },
    {
      title: "No Multiple Accounts",
      description: "One account per person. Multiple accounts will result in permanent suspension",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      type: "warning"
    },
    {
      title: "Genuine Engagement Only",
      description: "Use of bots, scripts, or automated tools is strictly prohibited",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      type: "warning"
    },
    {
      title: "Account Suspension Policy",
      description: "Failing to meet daily targets for 3 consecutive days results in suspension",
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      type: "warning"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How to Earn Money
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Start earning real money by watching videos on EarnPay. Follow our simple 5-step process to begin your journey towards financial independence.
          </p>
        </div>

        {/* Earning Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Earnings</h3>
              <p className="text-sm text-gray-600">
                Earn money immediately upon completing each video. No waiting periods or delays.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Growing Income</h3>
              <p className="text-sm text-gray-600">
                Consistent daily viewing leads to substantial monthly income. Many users earn ₹15,000+ per month.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Weekly Payouts</h3>
              <p className="text-sm text-gray-600">
                Get paid every Tuesday via direct bank transfer. Reliable and on-time payments guaranteed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Step-by-Step Guide */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            5 Simple Steps to Start Earning
          </h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/3 bg-gradient-to-br from-primary to-blue-600 text-white p-6 lg:p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold">{step.number}</span>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-blue-100">{step.description}</p>
                    </div>
                    
                    <div className="lg:w-2/3 p-6 lg:p-8">
                      <h4 className="font-semibold text-lg mb-4">What you need to do:</h4>
                      <div className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Earning Rules & Guidelines */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Important Rules & Guidelines
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {earningRules.map((rule, index) => (
              <Card key={index} className={`border-l-4 ${
                rule.type === 'requirement' ? 'border-l-green-500' : 
                rule.type === 'warning' ? 'border-l-red-500' : 'border-l-orange-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {rule.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{rule.title}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Daily Progress Example */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Your Daily Earning Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Daily Progress</span>
                    <span className="text-sm text-gray-600">6.5 / 8 hours</span>
                  </div>
                  <Progress value={81} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">1.5 hours remaining to meet daily target</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹487</div>
                    <div className="text-sm text-gray-600">Today's Earnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹2,340</div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">₹9,680</div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Tips */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Tips for Maximum Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Daily Habits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Set aside dedicated time blocks for video watching</li>
                  <li>• Start early in the day to meet your 8-hour target</li>
                  <li>• Take short breaks between videos to avoid fatigue</li>
                  <li>• Track your progress regularly throughout the day</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Best Practices</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Choose videos that interest you for better engagement</li>
                  <li>• Ensure stable internet connection for uninterrupted viewing</li>
                  <li>• Keep your account information updated</li>
                  <li>• Report any technical issues immediately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already earning money by watching videos. 
              Start your journey today and turn your free time into income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/videos">
                <Button size="lg" className="w-full sm:w-auto">
                  <Play className="w-5 h-5 mr-2" />
                  Start Watching Videos
                </Button>
              </Link>
              <Link href="/referrals">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Refer Friends & Earn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}