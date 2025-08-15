import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to Innovative Task Earn, operated by INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED (GST: 06AAGCI9044P1ZZ). 
              These Terms and Conditions govern your use of our task completion platform. By creating an account and using our services, you agree to these terms.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    By accessing and using Innovative Task Earn, you acknowledge that you have read, understood, 
                    and agree to be bound by these Terms and Conditions. If you do not agree with 
                    any part of these terms, you must not use our platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
                <div className="space-y-4 text-gray-700">
                  <p>To use Innovative Task Earn, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years of age</li>
                    <li>Be a resident of India</li>
                    <li>Provide valid government-issued identification</li>
                    <li>Have a valid Indian bank account</li>
                    <li>Not be prohibited from using our services by law</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
                <div className="space-y-4 text-gray-700">
                  <p>When creating an account, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Upload a valid government ID for verification</li>
                    <li>Provide correct bank account details</li>
                    <li>Keep your login credentials secure</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                  <p>
                    You are responsible for all activities that occur under your account.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Task Completion Requirements</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Task Categories</h3>
                  <p>
                    Available task categories include App Downloads, Business Reviews, Product Reviews, Channel Subscribe, Comments & Likes, and YouTube Video View. 
                    Each task must be completed as per provided instructions with proper proof submission.
                  </p>

                  <h3 className="font-medium mt-6">Task Completion Rules</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Tasks must be completed exactly as per instructions</li>
                    <li>Proper proof submission (screenshots, confirmations) required</li>
                    <li>Each task can only be completed once per account</li>
                    <li>Automated tools or bots are strictly prohibited</li>
                    <li>False submissions may result in account termination</li>
                    <li>Admin approval required before payment processing</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Referral Program</h2>
                <div className="space-y-4 text-gray-700">
                  <p>Our referral program allows you to earn ₹49 for each verified referral:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Referred users must use your unique referral code</li>
                    <li>Bonus is credited only after successful account verification</li>
                    <li>Self-referrals and fake accounts are prohibited</li>
                    <li>We reserve the right to investigate suspicious referral activity</li>
                    <li>Fraudulent referrals may result in account termination</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Payout Schedule</h3>
                  <p>
                    Payouts are processed weekly on Tuesdays. All payout requests submitted 
                    before the cutoff time will be included in the next weekly batch.
                  </p>

                  <h3 className="font-medium mt-6">Payment Processing</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Minimum payout amount may apply</li>
                    <li>Bank account details must be verified before payouts</li>
                    <li>We are not responsible for bank processing delays</li>
                    <li>Incorrect bank details may result in failed transfers</li>
                    <li>Tax obligations are your responsibility</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
                <div className="space-y-4 text-gray-700">
                  <p>You are prohibited from:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Creating multiple accounts</li>
                    <li>Using automated tools or bots</li>
                    <li>Submitting false or fraudulent task proof</li>
                    <li>Sharing account credentials</li>
                    <li>Attempting to circumvent platform restrictions</li>
                    <li>Engaging in fraudulent activities</li>
                    <li>Violating applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Account Suspension and Termination</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We may suspend or terminate your account for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violation of these terms and conditions</li>
                    <li>Failure to meet daily viewing requirements</li>
                    <li>Suspicious or fraudulent activity</li>
                    <li>Providing false information</li>
                    <li>Misuse of the referral program</li>
                  </ul>
                  <p>
                    Suspended accounts may forfeit pending earnings. We reserve the right 
                    to terminate accounts at our discretion.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    All content, videos, and materials on Innovative Task Earn are protected by intellectual 
                    property rights. Users may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Download or distribute platform content</li>
                    <li>Use content for commercial purposes</li>
                    <li>Reverse engineer platform technology</li>
                    <li>Create derivative works</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Platform Availability</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We strive to maintain platform availability but do not guarantee uninterrupted 
                    service. We may temporarily suspend the platform for maintenance, updates, 
                    or technical issues without prior notice.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Innovative Task Earn shall not be liable for any indirect, incidental, special, or 
                    consequential damages arising from your use of our platform. Our liability 
                    is limited to the amount of earnings in your account.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Privacy Policy</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Your privacy is important to us. Please review our Privacy Policy to 
                    understand how we collect, use, and protect your personal information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Modifications</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We reserve the right to modify these terms at any time. Users will be 
                    notified of material changes, and continued use of the platform constitutes 
                    acceptance of the updated terms.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    These terms are governed by the laws of India. Any disputes shall be 
                    resolved through arbitration in accordance with Indian arbitration laws.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>For questions about these terms, please contact us:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED</strong></p>
                    <p><strong>Email:</strong> support@innovativetaskearn.online</p>
                    <p><strong>Phone:</strong> +91-8000-XXX-XXX</p>
                    <p><strong>Address:</strong> C/O YOGESH, Kharbla 99, VATS STREET, KHARBLA</p>
                    <p>Hisar, Haryana - 125042, India</p>
                    <p><strong>GST:</strong> 06AAGCI9044P1ZZ</p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
