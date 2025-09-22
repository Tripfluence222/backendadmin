import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Tripfluence',
  description: 'Learn how Tripfluence collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              At Tripfluence (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              platform, website, and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account or use our services, we may collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-6">
              <li>Name, email address, and phone number</li>
              <li>Profile information and preferences</li>
              <li>Payment and billing information</li>
              <li>Government-issued ID for identity verification</li>
              <li>Communications with us and other users</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Usage Information</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect information about how you use our platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage patterns and preferences</li>
              <li>Location information (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide and improve our services</li>
              <li>Process bookings and payments</li>
              <li>Communicate with you about your account and bookings</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-xl font-medium mb-3">With Other Users</h3>
            <p className="text-muted-foreground mb-4">
              When you make a booking or list a space, certain information (like your name and profile) 
              may be shared with the host or guest to facilitate the transaction.
            </p>

            <h3 className="text-xl font-medium mb-3">With Service Providers</h3>
            <p className="text-muted-foreground mb-4">
              We work with third-party service providers who help us operate our platform, 
              including payment processors, customer support, and analytics providers.
            </p>

            <h3 className="text-xl font-medium mb-3">Legal Requirements</h3>
            <p className="text-muted-foreground mb-4">
              We may disclose your information if required by law, court order, or government request, 
              or to protect our rights and the safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
              <li>Withdrawal of consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and deliver personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">International Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place to protect your information during such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as necessary to provide our services, 
              comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you become aware that a child has provided 
              us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on our website and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-muted-foreground">
                <strong>Email:</strong> privacy@tripfluence.com<br />
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