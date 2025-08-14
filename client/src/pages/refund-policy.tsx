import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <RefreshCw className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Refund & Cancellation Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
              <p className="text-lg font-semibold text-blue-800 mb-2">Important Notice</p>
              <p className="text-blue-700">
                <strong>Innovative Task Earn does NOT sell any products, memberships, or subscriptions.</strong> 
                We are a digital task completion platform that only charges processing fees for specific services.
              </p>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              This Refund & Cancellation Policy applies exclusively to processing fees charged by 
              INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED through Innovative Task Earn platform.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What We Charge For</h2>
                <div className="space-y-4 text-gray-700">
                  <p><strong>We ONLY charge for the following processing services:</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>KYC Verification Fee:</strong> ₹99 (One-time processing fee for document verification)</li>
                    <li><strong>Account Reactivation Fee:</strong> ₹49 (Fee to unsuspend suspended accounts)</li>
                  </ul>
                  
                  <p className="mt-4"><strong>We do NOT charge for:</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account registration (Free)</li>
                    <li>Task completion access (Free)</li>
                    <li>Platform usage (Free)</li>
                    <li>Earnings withdrawal (Free)</li>
                    <li>Any products or memberships (We don't sell any)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Non-Refundable Processing Fees</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <p className="font-semibold text-red-800">All Processing Fees Are Non-Refundable</p>
                    <p className="text-red-700 mt-2">
                      Both KYC Verification Fee (₹99) and Account Reactivation Fee (₹49) are 
                      <strong> 100% non-refundable</strong> once the payment is successfully processed.
                    </p>
                  </div>
                  
                  <h3 className="font-medium mt-6">KYC Verification Fee (₹99) - NON-REFUNDABLE</h3>
                  <p>This fee covers administrative costs for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Manual document verification by our team</li>
                    <li>Identity authentication processes</li>
                    <li>Compliance and regulatory requirements</li>
                    <li>System processing and database updates</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>No refunds will be provided regardless of verification outcome.</strong>
                  </p>
                  
                  <h3 className="font-medium mt-6">Account Reactivation Fee (₹49) - NON-REFUNDABLE</h3>
                  <p>This fee covers:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Administrative review of suspended accounts</li>
                    <li>Manual account status verification</li>
                    <li>System reactivation processes</li>
                    <li>Compliance verification procedures</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>No refunds will be provided once payment is made.</strong>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. What Is NOT Refundable</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Processing Fees Are Never Refunded For:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Change of mind after payment</li>
                      <li>KYC rejection due to invalid documents</li>
                      <li>Account suspension due to policy violations</li>
                      <li>User-provided incorrect information</li>
                      <li>Normal processing timeframes</li>
                      <li>User decides not to continue using platform</li>
                      <li>Technical issues on user's end</li>
                      <li>Any other reason after service has been initiated</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Account Cancellation</h2>
                <div className="space-y-4 text-gray-700">
                  <p><strong>Users can delete their account at any time, but:</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>No refunds will be provided for any processing fees paid</li>
                    <li>Pending earnings will be processed before account closure</li>
                    <li>All user data will be permanently deleted within 30 days</li>
                    <li>Account reactivation after deletion requires new registration</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Payment Issues & Support</h2>
                <div className="space-y-4 text-gray-700">
                  <p><strong>For genuine payment issues only:</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Duplicate Charges:</strong> If accidentally charged twice, duplicate amount will be refunded</li>
                    <li><strong>Technical Errors:</strong> If payment failed but amount was debited, we will investigate</li>
                    <li><strong>System Malfunctions:</strong> Issues caused by our platform will be reviewed case-by-case</li>
                  </ul>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4">
                    <p className="font-semibold text-yellow-800">Important:</p>
                    <p className="text-yellow-700 text-sm">
                      Even in the above cases, refunds are processed only after thorough investigation 
                      and verification of the technical issue. Processing fees for completed services 
                      remain non-refundable.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. How to Report Payment Issues</h2>
                <div className="space-y-4 text-gray-700">
                  <p>Only contact support for genuine technical payment issues:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Email: support@innovativetaskearn.online</li>
                    <li>Subject: "Payment Issue - [Your User ID]"</li>
                    <li>Include: Transaction ID, payment screenshot, issue description</li>
                    <li>Response within 24-48 hours</li>
                  </ol>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>Note:</strong> Requests for refunds due to change of mind, 
                    dissatisfaction, or other non-technical reasons will not be entertained.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Final Notice</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                    <h3 className="font-bold text-red-800 text-lg mb-3">READ BEFORE MAKING PAYMENT</h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>✗ We do NOT sell any products, subscriptions, or memberships</li>
                      <li>✗ KYC Fee (₹99) is 100% NON-REFUNDABLE</li>
                      <li>✗ Reactivation Fee (₹49) is 100% NON-REFUNDABLE</li>
                      <li>✗ No refunds for change of mind or dissatisfaction</li>
                      <li>✗ Payment once made cannot be reversed</li>
                    </ul>
                    <p className="text-red-800 font-semibold mt-4">
                      By making payment, you agree that you understand and accept 
                      the non-refundable nature of all processing fees.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>For payment-related technical issues only:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED</strong></p>
                    <p>Email: support@innovativetaskearn.online</p>
                    <p>Address: C/O YOGESH, Kharbla 99, VATS STREET, KHARBLA</p>
                    <p>Hisar, Haryana - 125042</p>
                    <p>GST: 06AAGCI9044P1ZZ</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Policy Updates</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    This policy may be updated periodically. Users will be notified of 
                    changes via email and website notification. Continued use of our services 
                    after policy updates constitutes acceptance of the revised terms.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}