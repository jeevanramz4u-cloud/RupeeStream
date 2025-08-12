import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Target, Award, Clock, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About Innovative Task Earn
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing video monetization by rewarding genuine engagement and creating sustainable income opportunities for users worldwide.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To provide a transparent, fair, and sustainable platform where users can earn real money by engaging with quality video content, while ensuring authentic viewership through strict anti-fraud measures.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To become the world's leading video monetization platform that bridges content creators and viewers, creating value for both parties through innovative technology and user-centric design.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Why Choose Innovative Task Earn?
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Secure Platform</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Bank-grade security with KYC verification and secure payment processing through trusted gateways.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Community Driven</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Built for the community with referral rewards and social features that benefit everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Regular Payouts</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Weekly payout processing every Tuesday ensures you get your earnings on time, every time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Fair Earnings</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Transparent earning structure with clear requirements and no hidden fees or deductions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Quality Content</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Curated video library with diverse categories ensuring engaging and valuable content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Scalable Technology</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Built to handle 200,000+ users with enterprise-grade infrastructure and performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Stats */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">200K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">₹10L+</div>
                <div className="text-sm text-gray-600">Paid Out</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">1M+</div>
                <div className="text-sm text-gray-600">Videos Watched</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Built with Modern Technology
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">React 18</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">Radix UI</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Express.js</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Drizzle ORM</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">Google Cloud</Badge>
                  <Badge variant="secondary">Neon Database</Badge>
                  <Badge variant="secondary">Cashfree Gateway</Badge>
                  <Badge variant="secondary">Replit Platform</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Values */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p className="text-sm text-gray-600">Clear processes, open communication, and honest business practices.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Innovation</h3>
                <p className="text-sm text-gray-600">Continuously improving our platform with cutting-edge technology.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-sm text-gray-600">Building a supportive ecosystem that benefits all participants.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Security</h3>
                <p className="text-sm text-gray-600">Protecting user data and ensuring secure financial transactions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}