import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <p className="text-lg text-gray-700 mb-6">
              At Innovative Task Earn, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, and contact information</li>
                    <li>Government-issued identification documents for verification</li>
                    <li>Bank account details for payment processing</li>
                    <li>Profile information including profile pictures</li>
                  </ul>

                  <h3 className="font-medium mt-6">Usage Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Video watching history and preferences</li>
                    <li>Time spent on the platform and viewing patterns</li>
                    <li>Device information and browser details</li>
                    <li>IP address and location data</li>
                  </ul>

                  <h3 className="font-medium mt-6">Financial Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Earnings and transaction history</li>
                    <li>Payout requests and payment status</li>
                    <li>Referral activities and bonuses</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We use your information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account creation and user verification</li>
                    <li>Processing earnings and payments</li>
                    <li>Providing customer support and communication</li>
                    <li>Improving our platform and services</li>
                    <li>Preventing fraud and maintaining security</li>
                    <li>Managing referral programs and bonuses</li>
                    <li>Complying with legal and regulatory requirements</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We do not sell or share your personal information with third parties, except:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With payment processors for handling transactions</li>
                    <li>With service providers who assist in platform operations</li>
                    <li>When required by law or legal proceedings</li>
                    <li>To protect our rights and prevent fraud</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We implement robust security measures to protect your data:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>SSL encryption for all data transmission</li>
                    <li>Secure storage of personal and financial information</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication systems</li>
                    <li>Compliance with industry security standards</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                <div className="space-y-4 text-gray-700">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and review your personal information</li>
                    <li>Correct or update your data</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Data portability and export</li>
                    <li>File complaints with regulatory authorities</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Remember your login and preferences</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and experiences</li>
                    <li>Ensure platform security and prevent fraud</li>
                  </ul>
                  <p>You can manage cookie preferences through your browser settings.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We retain your personal information for as long as necessary to provide our services 
                    and comply with legal obligations. Account data is retained for a minimum of 7 years 
                    after account closure for financial and legal compliance purposes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Your data may be processed and stored in servers located in different countries. 
                    We ensure appropriate safeguards are in place to protect your information during 
                    international transfers.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Our platform is not intended for children under 18 years of age. We do not 
                    knowingly collect personal information from minors. If we become aware of 
                    such data collection, we will delete it immediately.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>For privacy-related questions or concerns, please contact us:</p>
                  <ul className="list-none space-y-2">
                    <li><strong>Email:</strong> privacy@earnpay.com</li>
                    <li><strong>Address:</strong> Innovative Task Earn Privacy Office, India</li>
                    <li><strong>Phone:</strong> +91-XXXX-XXXX</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Updates to This Policy</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    material changes by posting the new policy on our platform and updating the 
                    "Last updated" date. Your continued use of our services constitutes acceptance 
                    of the updated policy.
                  </p>
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
