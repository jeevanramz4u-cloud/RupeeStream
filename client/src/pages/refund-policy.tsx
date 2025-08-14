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
            <p className="text-lg text-gray-700 mb-6">
              This Refund & Cancellation Policy outlines the terms and conditions for refunds and cancellations 
              for services provided by INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED through Innovative Task Earn.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Service Types</h2>
                <div className="space-y-4 text-gray-700">
                  <p>Our platform provides two main types of services:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Task Completion Services:</strong> Digital tasks and earning opportunities</li>
                    <li><strong>Processing Fees:</strong> KYC verification (₹99) and Account Reactivation (₹49)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. KYC Processing Fee (₹99)</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Refund Eligibility:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Technical error on our platform during payment processing</li>
                    <li>Duplicate payment charges due to system malfunction</li>
                    <li>Service not provided due to company-related issues</li>
                  </ul>
                  
                  <h3 className="font-medium mt-6">Non-Refundable Scenarios:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>User provides incorrect or false documentation</li>
                    <li>User fails to complete the verification process within 30 days</li>
                    <li>User violates platform terms and conditions</li>
                    <li>User changes mind after successful verification</li>
                    <li>Normal processing delays within the stated timeframe</li>
                  </ul>

                  <h3 className="font-medium mt-6">Refund Timeline:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Refund request review: 2-3 business days</li>
                    <li>Approved refunds processed: 5-7 business days</li>
                    <li>Bank credit: 3-5 additional business days</li>
                    <li>Total refund timeline: 10-15 business days</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Reactivation Fee (₹49)</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Refund Eligibility:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account suspension due to technical error</li>
                    <li>Duplicate payment for reactivation</li>
                    <li>Proven system malfunction causing account suspension</li>
                  </ul>
                  
                  <h3 className="font-medium mt-6">Non-Refundable Scenarios:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account suspended due to policy violations</li>
                    <li>User-requested account suspension or deactivation</li>
                    <li>Legitimate suspension for not meeting requirements</li>
                    <li>User changes mind after successful reactivation</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Earnings & Task Payments</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Earning Disputes:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Task completion disputes reviewed within 24-48 hours</li>
                    <li>Approved earnings credited within 2-3 business days</li>
                    <li>Rejected submissions explained with reason</li>
                    <li>Appeal process available for disputed decisions</li>
                  </ul>
                  
                  <h3 className="font-medium mt-6">Payment Issues:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Failed bank transfers investigated and reprocessed</li>
                    <li>Incorrect bank details: user responsible for correction</li>
                    <li>Duplicate payments reversed within 5-7 business days</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cancellation Policy</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">Account Cancellation:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Users can request account cancellation anytime</li>
                    <li>Pending earnings will be processed before closure</li>
                    <li>No refund for processing fees after successful verification</li>
                    <li>All data deleted within 30 days of cancellation</li>
                  </ul>
                  
                  <h3 className="font-medium mt-6">Service Interruption:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Planned maintenance: 24-48 hours advance notice</li>
                    <li>Emergency maintenance: notification as soon as possible</li>
                    <li>Service credits for extended unplanned downtime (longer than 24 hours)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Refund Process</h2>
                <div className="space-y-4 text-gray-700">
                  <h3 className="font-medium">How to Request a Refund:</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Contact support at support@innovativetaskearn.online</li>
                    <li>Provide transaction details and reason for refund</li>
                    <li>Submit supporting documentation if required</li>
                    <li>Wait for review and approval/rejection notification</li>
                    <li>Approved refunds processed to original payment method</li>
                  </ol>
                  
                  <h3 className="font-medium mt-6">Required Information:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>User ID and registered email address</li>
                    <li>Transaction ID or payment reference number</li>
                    <li>Date and amount of payment</li>
                    <li>Detailed reason for refund request</li>
                    <li>Screenshots or proof of issue (if applicable)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Refund Methods</h2>
                <div className="space-y-4 text-gray-700">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Bank Transfer:</strong> Direct transfer to original bank account</li>
                    <li><strong>UPI:</strong> Refund to original UPI ID used for payment</li>
                    <li><strong>Wallet:</strong> Credit to platform wallet (if applicable)</li>
                    <li><strong>Payment Gateway:</strong> Automatic reversal to original payment method</li>
                  </ul>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Refunds are processed to the same payment method used for the original transaction. 
                      Bank processing times may vary and are beyond our control.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Exceptions & Limitations</h2>
                <div className="space-y-4 text-gray-700">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Refund requests must be made within 30 days of payment</li>
                    <li>No refunds for services already utilized or completed</li>
                    <li>Processing fees are non-refundable once service is delivered</li>
                    <li>Fraudulent refund requests may result in account termination</li>
                    <li>Maximum refund amount limited to original payment</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>For refund and cancellation queries:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED</strong></p>
                    <p>Email: support@innovativetaskearn.online</p>
                    <p>Phone: +91-8000-XXX-XXX</p>
                    <p>Address: C/O YOGESH, Kharbla 99, VATS STREET, KHARBLA</p>
                    <p>Hisar, Haryana - 125042</p>
                    <p>GST: 06AAGCI9044P1ZZ</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    Customer support available Monday to Friday, 9:00 AM to 6:00 PM IST. 
                    Email support available 24/7 with response within 24 hours.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Policy Updates</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    This policy may be updated periodically to reflect changes in our services or legal requirements. 
                    Users will be notified of significant changes via email and website notification. 
                    Continued use of our services after policy updates constitutes acceptance of the revised terms.
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