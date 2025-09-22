import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Tripfluence',
  description: 'Read the terms and conditions for using the Tripfluence platform.',
};

export default function TermsPage() {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using the Tripfluence platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
              If you do not agree to these Terms, you may not access or use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Tripfluence is an online marketplace that connects people who need spaces for events (&quot;Guests&quot;) 
              with people who have spaces to offer (&quot;Hosts&quot;). Our platform facilitates bookings, payments, 
              and communication between Guests and Hosts.
            </p>
            <p className="text-muted-foreground">
              We are not a party to the rental agreements between Guests and Hosts, and we do not own, 
              operate, or control any spaces listed on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
            <p className="text-muted-foreground mb-4">
              To use our Service, you must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into contracts</li>
              <li>Provide accurate and complete information</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Keeping your account information accurate and up-to-date</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Host Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              As a Host, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide accurate descriptions and photos of your space</li>
              <li>Honor confirmed bookings</li>
              <li>Maintain your space in a safe and clean condition</li>
              <li>Comply with all applicable laws, including zoning and licensing requirements</li>
              <li>Respond to booking requests and Guest communications promptly</li>
              <li>Ensure you have necessary permissions and insurance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Guest Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              As a Guest, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Use spaces only for their intended purpose</li>
              <li>Respect the Host&apos;s property and rules</li>
              <li>Leave spaces in the same condition as found</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Provide accurate information about your event</li>
              <li>Pay all fees when due</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Bookings and Payments</h2>
            <p className="text-muted-foreground mb-4">
              Booking requests are offers to rent a space. Bookings are confirmed when the Host accepts your request. 
              Payment is typically processed at the time of booking confirmation.
            </p>
            <p className="text-muted-foreground mb-4">
              We charge service fees for our platform. All fees are clearly disclosed before booking confirmation.
            </p>
            <p className="text-muted-foreground">
              Cancellation policies vary by Host and are displayed on each listing. 
              Refunds are processed according to the applicable cancellation policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Use the Service for illegal activities</li>
              <li>Circumvent our payment system</li>
              <li>Create false or misleading listings</li>
              <li>Discriminate against users based on protected characteristics</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users&apos; use of the Service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Content and Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              You retain ownership of content you post on our platform but grant us a license to use, 
              display, and distribute it in connection with our Service.
            </p>
            <p className="text-muted-foreground">
              Our platform, including its design, functionality, and content, is protected by intellectual property laws. 
              You may not copy, modify, or distribute our platform without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Privacy</h2>
            <p className="text-muted-foreground">
              Our Privacy Policy explains how we collect, use, and protect your information. 
              By using our Service, you consent to our privacy practices as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimers</h2>
            <p className="text-muted-foreground mb-4">
              Our Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>The accuracy of listings or user-generated content</li>
              <li>The quality or safety of spaces or events</li>
              <li>That bookings will be honored</li>
              <li>Uninterrupted or error-free service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, Tripfluence and its affiliates, officers, directors, 
              and employees shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising from your use of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Tripfluence from any claims, damages, losses, 
              or expenses arising from your use of our Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from these Terms or your use of our Service will be resolved through 
              binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate your access to our Service at any time for violation of these Terms 
              or for any other reason. You may terminate your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. We will notify you of material changes by posting 
              the updated Terms on our website and updating the &quot;Last updated&quot; date. 
              Continued use of our Service constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">17. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">18. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-muted-foreground">
                <strong>Email:</strong> legal@tripfluence.com<br />
                <strong>Address:</strong> 123 Innovation Street, San Francisco, CA 94105<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}