import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Coins,
  Users,
  CheckCircle,
  Shield,
  Wallet,
  Calendar,
  AlertTriangle,
  FileText,
  Eye
} from "lucide-react";
import { Link } from "wouter";

export default function HowToEarn() {
  const steps = [
    {
      number: 1,
      title: "Sign Up & Verify",
      description: "Create your account using valid email and upload government ID for verification",
      icon: <Shield className="w-6 h-6" />,
      details: [
        "Register with valid email address",
        "Upload government-issued ID (Aadhaar, Passport, or Driver's License)",
        "Provide bank account details for payouts",
        "Wait 24-48 hours for admin verification"
      ]
    },
    {
      number: 2,
      title: "Start Watching Videos",
      description: "Browse our video library and watch complete videos to earn money",
      icon: <Play className="w-6 h-6" />,
      details: [
        "Choose videos from various categories",
        "Watch videos completely from start to finish",
        "No skipping, fast-forwarding, or rewinding allowed",
        "Earnings are credited automatically after completion"
      ]
    },
    {
      number: 3,
      title: "Meet Daily Target",
      description: "Watch videos for 8 hours daily to maintain account in good standing",
      icon: <Clock className="w-6 h-6" />,
      details: [
        "Minimum 8 hours of video watching required daily",
        "Track your progress on the dashboard",
        "Account suspension if target not met consistently",
        "Flexible scheduling - watch anytime during the day"
      ]
    },
    {
      number: 4,
      title: "Earn & Get Paid",
      description: "Accumulate earnings and request weekly payouts every Tuesday",
      icon: <Wallet className="w-6 h-6" />,
      details: [
        "Earnings added to balance after video completion",
        "Request payouts anytime (processed on Tuesdays)",
        "Direct bank transfer to verified account",
        "Track all transactions in earnings history"
      ]
    }
  ];

  const earningMethods = [
    {
      title: "Video Watching",
      description: "Primary way to earn money on EarnPay",
      amount: "₹5 - ₹50",
      icon: <Play className="w-5 h-5" />,
      details: [
        "Earn money for each video watched completely",
        "Earning amount varies by video length and category",
        "No limit on daily video earnings",
        "Videos must be watched without interruption"
      ]
    },
    {
      title: "Referral Bonus",
      description: "Invite friends and earn when they get verified",
      amount: "₹49",
      icon: <Users className="w-5 h-5" />,
      details: [
        "Share your unique referral code",
        "Earn ₹49 for each verified referral",
        "No limit on number of referrals",
        "Bonus credited after friend's verification"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/api/login">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Earn Money on EarnPay</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to maximize your earnings by watching videos and referring friends. 
            Follow our simple process to start earning real money today.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Getting Started in 4 Easy Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={step.number} className="relative">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{step.number}</span>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Earning Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Ways to Earn Money</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {earningMethods.map((method, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {method.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{method.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{method.description}</p>
                      </div>
                    </div>
                    <Badge className="bg-accent text-white font-bold text-lg px-3 py-1">
                      {method.amount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {method.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-secondary" />
                        </div>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Rules */}
        <Card className="mb-16 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Rules & Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-orange-800 mb-3">Daily Requirements</h3>
                <ul className="space-y-2 text-orange-700">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Watch videos for minimum 8 hours daily
                  </li>
                  <li className="flex items-start">
                    <Eye className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    No skipping or fast-forwarding allowed
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Account suspension if target not met
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-orange-800 mb-3">Payout Information</h3>
                <ul className="space-y-2 text-orange-700">
                  <li className="flex items-start">
                    <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Weekly payouts every Tuesday
                  </li>
                  <li className="flex items-start">
                    <Wallet className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Verified bank account required
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Government ID verification mandatory
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How much can I earn per day?</h3>
                <p className="text-gray-700">
                  Daily earnings vary based on the videos you watch and your referral activity. 
                  With consistent 8-hour daily viewing, you can earn between ₹200-800 per day, 
                  plus ₹49 for each verified referral.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens if I don't meet the 8-hour target?</h3>
                <p className="text-gray-700">
                  Consistently failing to meet the daily 8-hour requirement may result in 
                  account suspension. We track your daily activity and will notify you if 
                  you're falling behind on your targets.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How long does verification take?</h3>
                <p className="text-gray-700">
                  Account verification typically takes 24-48 hours. Our admin team manually 
                  reviews all submitted documents to ensure authenticity and security.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use multiple devices?</h3>
                <p className="text-gray-700">
                  No, you can only use one device per account at a time. Using multiple devices 
                  simultaneously or sharing accounts is strictly prohibited and may result in 
                  account termination.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-primary rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-lg mb-6 text-blue-100">
            Join thousands of users who are already earning money by watching videos on EarnPay.
          </p>
          <Link href="/api/login">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-blue-50">
              <Play className="w-5 h-5 mr-2" />
              Start Earning Now
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
