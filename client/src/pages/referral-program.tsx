import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Gift, 
  TrendingUp, 
  CheckCircle,
  Share2,
  Wallet,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function ReferralProgram() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Innovative Task Earn Referral Program
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Earn ₹49 for every friend you refer who completes verification. 
            No limits, instant rewards, and unlimited earning potential.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">₹49</div>
              <div className="text-sm text-gray-600">Per Verified Referral</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
              <div className="text-sm text-gray-600">Unlimited Referrals</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">24hr</div>
              <div className="text-sm text-gray-600">Instant Credit</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">How Referral Program Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Join Innovative Task Earn</h3>
                <p className="text-sm text-gray-600">
                  Sign up and complete your KYC verification to start referring friends.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Share Your Code</h3>
                <p className="text-sm text-gray-600">
                  Get your unique referral code and share it with friends via WhatsApp, social media, or direct messaging.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Friend Joins</h3>
                <p className="text-sm text-gray-600">
                  Your friend signs up using your referral code and completes their KYC verification.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">4. Earn ₹49</h3>
                <p className="text-sm text-gray-600">
                  You earn ₹49 instantly when your friend completes verification. No waiting!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Real Success Stories</CardTitle>
            <p className="text-center text-gray-600">
              See how our top referrers are earning thousands every month
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Priya K.</h4>
                    <p className="text-sm text-gray-600">Mumbai</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">₹7,350</div>
                <p className="text-sm text-gray-600 mb-3">150 successful referrals</p>
                <p className="text-xs text-gray-500 italic">
                  "Shared with college friends and family groups. Easy extra income!"
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Rahul S.</h4>
                    <p className="text-sm text-gray-600">Delhi</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">₹4,361</div>
                <p className="text-sm text-gray-600 mb-3">89 successful referrals</p>
                <p className="text-xs text-gray-500 italic">
                  "Active in WhatsApp groups. Referrals convert really well!"
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Anita M.</h4>
                    <p className="text-sm text-gray-600">Bangalore</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-2">₹3,283</div>
                <p className="text-sm text-gray-600 mb-3">67 successful referrals</p>
                <p className="text-xs text-gray-500 italic">
                  "Social media sharing works great. Consistent monthly income!"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Why Refer Friends to Innovative Task Earn?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Instant ₹49 Bonus</h4>
                    <p className="text-sm text-gray-600">
                      Get paid immediately when your friend completes verification
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">No Limits</h4>
                    <p className="text-sm text-gray-600">
                      Refer as many friends as you want. More referrals = more earnings
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Easy Sharing</h4>
                    <p className="text-sm text-gray-600">
                      Share via WhatsApp, social media, or direct links
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Help Friends Earn</h4>
                    <p className="text-sm text-gray-600">
                      Your friends also benefit by earning money watching videos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Best Sharing Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-700">Top Performing Channels</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      WhatsApp family and friends groups
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Facebook and Instagram stories
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      College and workplace groups
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Direct personal recommendations
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-blue-700">Effective Message Example</h4>
                  <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500 text-sm">
                    <p className="italic text-gray-700">
                      "I'm earning ₹15,000+ monthly by watching videos on Innovative Task Earn! 
                      Use my code [CODE] to get started. It's genuine and pays on time!"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Referral Requirements & Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-green-700">Requirements</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">You must have a verified Innovative Task Earn account</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Your KYC verification must be completed</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Referred user must complete full KYC verification</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-blue-700">Important Rules</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Each person can only be referred once</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Multiple accounts by same person prohibited</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Bonus credited within 24 hours of KYC completion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Referring Friends?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users earning extra income through referrals. 
              Sign up today and get your unique referral code to start earning ₹49 per verified referral.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Join & Get Referral Code
                </Button>
              </Link>
              <Link href="/how-to-earn">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More About Earning
                  <ArrowRight className="w-5 h-5 ml-2" />
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