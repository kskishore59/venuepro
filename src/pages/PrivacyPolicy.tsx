import React from 'react';
import { ArrowLeft, ShieldCheck, Cookie, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Header Branding */}
        <div className="p-8 bg-[#107ed8] text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="space-y-1 z-10">
            <Link to="/" className="inline-flex items-center text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-white/80 text-sm">Last updated: May 17, 2026</p>
          </div>
          <ShieldCheck className="w-16 h-16 text-white/20 z-10 hidden sm:block" />
        </div>

        {/* content body */}
        <div className="p-8 sm:p-10 prose prose-slate max-w-none space-y-8 text-gray-700">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-3 text-sm text-blue-800 leading-relaxed">
            <Globe className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <strong>Compliance Notice:</strong> This privacy policy has been defined for the VenuePro application to comply with the <strong>Indian Digital Personal Data Protection (DPDP) Act, 2023</strong>, <strong>GDPR</strong>, <strong>CCPA</strong>, and standard international data controller regulations.
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center"><Lock className="w-5 h-5 mr-2 text-primary" /> 1. Information We Collect</h2>
            <p>VenuePro acts as a SaaS platform for venue and event operations. We collect and process the following categories of personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>User Account Information:</strong> Name, professional email address, phone number, and venue organization details when registering for the service.</li>
              <li><strong>Customer Inquiries & Leads:</strong> Names, contact numbers, email addresses, planned event dates, and budget specifications entered into the CRM module.</li>
              <li><strong>Booking Details:</strong> Information regarding client events, dates, hall capacities, specific venue setups, and catering options.</li>
              <li><strong>Payment & Financial Data:</strong> Receipts, transactions, GSTIN, and PAN records collected for tax filing and invoices. We do not store credit card details locally; transactions are managed securely by PCI-DSS compliant providers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-primary" /> 2. Ground of Processing & Consent (DPDP Act & GDPR)</h2>
            <p>Under the Indian DPDP Act 2023 and GDPR, we process personal data under the following legitimate grounds:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Consent:</strong> When organizers submit inquiry forms, site visits, or sign contracts, they give explicit consent. Consent can be withdrawn by writing to our designated Data Protection Officer.</li>
              <li><strong>Contractual Obligation:</strong> Execution of terms between venue managers and event hosts (e.g. billing, slot reservations).</li>
              <li><strong>Legal Compliance:</strong> Retaining financial statements and tax summaries (GST/PAN) to comply with Indian accounting laws.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center"><Cookie className="w-5 h-5 mr-2 text-primary" /> 3. Cookie Policy & Tracking</h2>
            <p>VenuePro uses necessary session tracking and operational cookies to deliver core application services:</p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Cookie Type</th>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Purpose</th>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 font-medium">Session JWT Token</td>
                    <td className="px-4 py-2 text-gray-600">Maintains authorization and secure authentication on backend calls.</td>
                    <td className="px-4 py-2">Session (Local Storage)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Preferences Cookie</td>
                    <td className="px-4 py-2 text-gray-600">Preserves local client view choices (e.g. Lead Kanban board vs List view preference).</td>
                    <td className="px-4 py-2">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">4. Your Rights Under Global Frameworks</h2>
            <p>We respect international privacy guidelines, offering comprehensive user rights:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm">DPDP Act (India)</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Right to access, correct, delete personal data, and nominate representatives. Grievance redressal is handled directly by our DPO.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm">GDPR (EU)</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Right to data portability, object to processing, restriction, and right to be forgotten (erasure). Data is secured as per standard clauses.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm">CCPA (California)</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Right to know what data is collected, opt-out of the "sale" of personal information, and receive equal service without discrimination.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">5. Data Retention & Isolation</h2>
            <p>
              Data is segmented and securely isolated inside dedicated Postgres schemas with Postgres **Row Level Security (RLS)** active. 
              We retain personal data for only as long as necessary to fulfill business services and complete mandatory tax Audits under Indian legislation.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Contact our Data Protection Officer (DPO)</h2>
            <p className="text-sm">For queries, consent withdrawals, or deletion requests, please contact our privacy compliance desk:</p>
            <div className="bg-gray-50 p-4 rounded-xl border text-sm space-y-1 mt-2">
              <p><strong>Email:</strong> privacy@venuepro.in</p>
              <p><strong>Address:</strong> Tech Parks Hub, Outer Ring Road, Bangalore, Karnataka - 560103, India</p>
              <p><strong>Grievance Redressal Officer:</strong> compliance@venuepro.in</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
