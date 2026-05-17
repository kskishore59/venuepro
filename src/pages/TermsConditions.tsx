import React from 'react';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsConditions: React.FC = () => {
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
            <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
            <p className="text-white/80 text-sm">Last updated: May 17, 2026</p>
          </div>
          <Scale className="w-16 h-16 text-white/20 z-10 hidden sm:block" />
        </div>

        {/* Content body */}
        <div className="p-8 sm:p-10 prose prose-slate max-w-none space-y-8 text-gray-700">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start space-x-3 text-sm text-orange-800 leading-relaxed">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-600" />
            <div>
              <strong>Legal Notice:</strong> These Terms and Conditions constitute a legally binding service agreement between your organization and VenuePro. This is customized to comply with the <strong>Indian Information Technology Act, 2000</strong> and <strong>Consumer Protection guidelines</strong>.
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center"><Scale className="w-5 h-5 mr-2 text-primary" /> 1. Operational Framework</h2>
            <p>VenuePro offers specialized SaaS systems for venue management, calendar automation, booking tracking, CRM pipelines, and payment records. By accessing the software, you agree to comply with all clauses outlined herein.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-primary" /> 2. Booking Confirmed, Hold Policies & Pricing Sync</h2>
            <p>Our software incorporates automated slot coordination tools. However, ultimate operational verification rests on the venue management team:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Tentative Hold:</strong> Creating an inquiry holds a slot tentatively. This hold is automatically expired unless an advance payment is cleared within the duration defined by your organization's settings.</li>
              <li><strong>Double Booking Prevention:</strong> The database enforces absolute single-hall unique date locks. The application blocks double bookings on confirmed slots, protecting you from scheduling overrides.</li>
              <li><strong>Pricing:</strong> Calculations (e.g. GST billing, base rentals, slots) are synced directly with the configurations entered in your database's Hall settings page. VenuePro is not liable for errors originating from invalid pricing properties entered manually.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-primary" /> 3. Indian Market Taxes (GST) & Invoices</h2>
            <p>Compliance with the Goods and Services Tax (GST) is essential for operations in the Indian market:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Organizations operating in India must provide valid GSTIN and PAN details in the settings module to produce legitimate tax invoices.</li>
              <li>Calculations (CGST, SGST, IGST) must be set in your template. VenuePro acts as the calculation engine and invoice compiler; you hold full responsibility for correct tax filing and payouts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">4. Abuse Prevention & Account Suspension</h2>
            <p>We enforce strict service policies. To ensure security and maintain database availability, the following activities are strictly prohibited:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Engaging in reverse-engineering of endpoints, bypass of Postgres Row Level Security (RLS), or scripting high-frequency automated inputs.</li>
              <li>Exceeding standard database throughput. High-frequency automated attacks or scripts will trigger the API gateway rate limiting, leading to temporary or permanent profile lockouts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">5. Limitation of Liability</h2>
            <p>
              VenuePro delivers state-of-the-art software systems but does not guarantee uninterrupted operational hosting.
              Under no circumstances shall we be held liable for losses resulting from event cancellations, guest limit disputes,
              local internet failures, or incorrect database entries made by your operators.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">6. Dispute Jurisdiction</h2>
            <p className="text-sm leading-relaxed">
              These terms are governed by the laws of the Republic of India. Any disputes, claims, or actions originating from
              use of VenuePro shall be submitted to the exclusive jurisdiction of the state courts in **Bangalore, Karnataka, India**.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
