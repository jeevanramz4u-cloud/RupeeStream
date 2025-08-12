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
            Start earning real money by watching videos on Innovative Task Earn. Follow our simple 5-step process to begin your journey towards financial independence.
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

        {/* Refer and Earn Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Refer Friends & Earn ₹49 Per Verified Referral
          </h2>
          
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 mb-8">
            <CardContent className="pt-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">
                  Boost Your Earnings with Referrals
                </h3>
                <p className="text-purple-700 max-w-2xl mx-auto">
                  Share Innovative Task Earn with friends and family to earn additional income. Every person you refer who completes KYC verification earns you ₹49 instantly.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-2">₹49</div>
                  <div className="text-sm text-gray-600">Per Verified Referral</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                  <div className="text-sm text-gray-600">Unlimited Referrals</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">24hr</div>
                  <div className="text-sm text-gray-600">Instant Credit</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Referral Program Works */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  How Referral Program Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Get Your Referral Code</h4>
                      <p className="text-sm text-gray-600">
                        Visit your Referrals page to get your unique referral code and sharing links.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Share with Friends</h4>
                      <p className="text-sm text-gray-600">
                        Share your referral code via WhatsApp, social media, or direct messaging.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Friend Signs Up</h4>
                      <p className="text-sm text-gray-600">
                        Your friend registers using your referral code and creates their account.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">KYC Completion</h4>
                      <p className="text-sm text-gray-600">
                        When your friend completes KYC verification, you earn ₹49 instantly.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Referral Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Your Account Status</h4>
                      <p className="text-sm text-gray-600">
                        You must have a verified account with completed KYC to refer others.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Unique Users Only</h4>
                      <p className="text-sm text-gray-600">
                        Each person can only be referred once. Multiple accounts by same person are prohibited.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Complete KYC Required</h4>
                      <p className="text-sm text-gray-600">
                        Referral bonus is credited only after the referred user completes KYC verification.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">No Limit</h4>
                      <p className="text-sm text-gray-600">
                        There's no limit to how many people you can refer. More referrals = more earnings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Success Examples */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">Real Referral Success Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-green-600 mb-2">150 Referrals</div>
                  <div className="text-sm text-gray-600 mb-2">Priya from Mumbai</div>
                  <div className="text-lg font-semibold text-green-700">₹7,350 Earned</div>
                  <p className="text-xs text-gray-500 mt-2">Shared with college friends and family</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">89 Referrals</div>
                  <div className="text-sm text-gray-600 mb-2">Rahul from Delhi</div>
                  <div className="text-lg font-semibold text-blue-700">₹4,361 Earned</div>
                  <p className="text-xs text-gray-500 mt-2">Active in WhatsApp groups</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-2">67 Referrals</div>
                  <div className="text-sm text-gray-600 mb-2">Anita from Bangalore</div>
                  <div className="text-lg font-semibold text-purple-700">₹3,283 Earned</div>
                  <p className="text-xs text-gray-500 mt-2">Social media sharing expert</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Tips */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Referral Success Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-green-700">Best Places to Share</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      WhatsApp family and friends groups
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Facebook and Instagram stories
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      College and workplace groups
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Telegram earning communities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Direct personal recommendations
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-blue-700">Effective Sharing Messages</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="italic text-gray-700">
                        "I'm earning ₹15,000+ monthly by watching videos on Innovative Task Earn! 
                        Use my code [CODE] to get started and we both benefit. It's genuine and pays on time!"
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
                      <p className="italic text-gray-700">
                        "Found this amazing app where you earn money just by watching videos. 
                        Weekly payouts, no investment needed. Join with my referral: [CODE]"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Track Your Referral Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">Real-Time</div>
                  <div className="text-sm text-gray-600">Tracking</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-green-600">Instant</div>
                  <div className="text-sm text-gray-600">Notifications</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">Detailed</div>
                  <div className="text-sm text-gray-600">Analytics</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">Monthly</div>
                  <div className="text-sm text-gray-600">Reports</div>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-4">
                Monitor your referral progress in the Referrals section of your dashboard. 
                See who signed up, their KYC status, and your earnings in real-time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already earning money by watching videos and referring friends. 
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
                  Start Referring Friends
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