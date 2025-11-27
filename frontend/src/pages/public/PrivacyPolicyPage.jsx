import React from 'react';

// TODO: Add route in App.jsx => <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Last updated: {'{{LAST_UPDATED_DATE}}'}
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Privacy Policy</h1>
          <p className="mt-4 text-slate-300">
            This Privacy Policy explains how {'AivraSol'} collects, uses,
            and protects information in connection with the Pre-Doctor AI platform, available at
            {'AivraSol'}. Pre-Doctor AI is a B2B multi-tenant SaaS solution provided to
            hospitals and clinics. It is not a direct-to-consumer medical service. We strongly advise
            all hospital clients to review this policy with their own legal counsel; this document is
            provided for general informational purposes only and does not constitute legal advice.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-6 py-12 text-slate-800">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900">1. Introduction</h2>
          <p className="mt-4 leading-relaxed">
            Pre-Doctor AI enables hospitals and clinics to provide AI-assisted pre-assessment
            experiences for their patients. This policy describes the categories of information we
            handle, the purposes for using it, and the measures in place to safeguard it. Hospitals and
            clinics (“Clients”) remain the primary custodians of patient information; {'AivraSol '}
             acts as their technology provider and implements appropriate safeguards to support
            regulatory compliance.
          </p>
        </section>

        {/* Scope */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900">2. Scope</h2>
          <p className="mt-4 leading-relaxed">
            This Privacy Policy applies to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Hospitals and clinics that subscribe to Pre-Doctor AI, including their administrators,
              clinicians, and operations staff who access the platform.
            </li>
            <li>
              Patient users who submit symptoms or complete pre-assessment questionnaires via their
              hospital’s Pre-Doctor AI portal.
            </li>
            <li>
              Visitors to {'AivraSol'} who review product information or contact us for
              demos.
            </li>
          </ul>
        </section>

        {/* Information We Collect */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">3. Information We Collect</h2>
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                3.1 Information from Hospital Clients
              </h3>
              <p className="mt-3 leading-relaxed">
                Clients provide business contact information (e.g., name, role, professional email,
                phone number), institution details, billing and invoicing data, and preferences such as
                branding assets or AI usage configurations.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">3.2 Staff User Information</h3>
              <p className="mt-3 leading-relaxed">
                For administrators, doctors, and support staff, we collect names, email addresses,
                roles, login credentials, session activity, and usage logs. These records help enforce
                access controls, maintain security, and provide audit trails required by hospital
                clients.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">3.3 Patient Information</h3>
              <p className="mt-3 leading-relaxed">
                When patients use a hospital’s Pre-Doctor AI portal, they may submit demographic data
                (such as age, gender, location) and health-related information (symptom descriptions,
                questionnaire responses, supporting context). Hospitals remain the primary custodians
                of this data. {'AivraSol'} processes it as a service provider or data processor,
                following the hospital’s instructions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">3.4 Technical Data</h3>
              <p className="mt-3 leading-relaxed">
                We may collect technical information such as IP addresses, browser type, device
                characteristics, operating system version, cookies, and analytics identifiers. This
                assists in security monitoring, system performance, and improving user experience.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">4. How We Use Information</h2>
          <p className="mt-4 leading-relaxed">
            We use collected information to deliver and improve Pre-Doctor AI, including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Provisioning accounts, dashboards, and hospital-branded patient portals.</li>
            <li>
              Generating AI-assisted pre-assessment reports, summaries, and workflow outputs based on
              patient inputs.
            </li>
            <li>Maintaining security, access controls, logging, and auditing.</li>
            <li>
              Aggregating or anonymizing usage data to enhance system performance and reliability.
            </li>
            <li>Communicating with Clients regarding product updates, support, and billing.</li>
          </ul>
        </section>

        {/* AI & Health Section */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">5. AI, Health Data & Clinical Responsibility</h2>
          <p className="mt-4 leading-relaxed">
            Pre-Doctor AI uses natural language prompts and models to help patients describe their
            health concerns. AI outputs are designed for pre-assessment and workflow support. They are
            not a medical diagnosis, and they must always be reviewed by qualified clinical staff.
            Hospital users must ensure that AI-generated suggestions are interpreted in line with
            medical judgment and applicable regulations. We may transmit specific prompts or content to
            third-party AI providers under strict agreements. Where supported, we prevent those
            providers from using this data to train their models beyond our requests.
          </p>
        </section>

        {/* Legal Basis */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">6. Roles & Legal Basis</h2>
          <p className="mt-4 leading-relaxed">
            For patient data, hospitals are typically the controllers (or equivalent under local
            privacy laws). {'AivraSol'} acts as their processor or service provider, handling
            patient information per the hospital’s instructions. For business contact details and
            account management, {'AivraSol'} may act as a controller under applicable laws and
            process information based on legitimate interests or contractual necessity.
          </p>
        </section>

        {/* Sharing */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">7. Data Sharing & Third-Party Services</h2>
          <p className="mt-4 leading-relaxed">
            We share data only as necessary to provide the Pre-Doctor AI service:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Cloud hosting, infrastructure, and database providers.</li>
            <li>Analytics, logging, and monitoring tools.</li>
            <li>AI model providers used to process prompts and generate outputs.</li>
            <li>Payment or billing partners (if applicable).</li>
            <li>
              Regulatory or legal authorities if required to comply with law, protect rights, or enforce
              agreements.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed">
            Where data is transferred to a different jurisdiction, we rely on appropriate contractual
            safeguards or other lawful mechanisms.
          </p>
        </section>

        {/* Retention */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">8. Data Retention</h2>
          <p className="mt-4 leading-relaxed">
            {'AivraSol'} retains Client records, system logs, and AI-generated outputs for as
            long as needed to fulfill contractual obligations, comply with legal requirements, or
            maintain security. Hospitals may configure their own retention periods for patient data
            within the platform. When contracts end, we follow data deletion or return procedures
            agreed upon with each hospital.
          </p>
        </section>

        {/* Security */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">9. Security</h2>
          <p className="mt-4 leading-relaxed">
            We implement industry-standard administrative, technical, and physical safeguards,
            including role-based access controls, encryption in transit, and audit logging. We cannot
            guarantee absolute security, but we continually review and update our measures to protect
            hospital and patient information.
          </p>
        </section>

        {/* Rights */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">10. Your Rights & Choices</h2>
          <p className="mt-4 leading-relaxed">
            Hospital contacts and staff may request access, correction, or deletion of their account
            details, subject to contractual obligations. Patients should contact their hospital
            directly for inquiries about pre-assessment data. For privacy questions, hospitals can
            email {'AivraSol'}, referencing their Client account.
          </p>
        </section>

        {/* Cookies */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">11. Cookies & Tracking</h2>
          <p className="mt-4 leading-relaxed">
            We use cookies and similar technologies for session management, analytics, and improving
            the website experience. Visitors can adjust browser settings to disable non-essential
            cookies, though certain features may not function optimally.
          </p>
        </section>

        {/* Changes */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            12. Changes to this Privacy Policy
          </h2>
          <p className="mt-4 leading-relaxed">
            We may update this policy from time to time. Material changes will be communicated via this
            page or through direct notices to hospital clients. Continued use of the platform after
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* Contact */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">13. Contact Information</h2>
          <p className="mt-4 leading-relaxed">
            For questions about this Privacy Policy or our data practices, please contact:
          </p>
          <p className="mt-2 leading-relaxed">
            {'AivraSol'}
           
            Email:{' '}
            <a href="mailto:aivrasol@gmail.com" className="text-teal-600 underline">
              {'aivrasol@gmail.com'}
            </a>
          </p>
          <p className="mt-4 text-sm text-slate-500">
            This Privacy Policy is provided for general information only and does not constitute legal
            advice. We recommend that each hospital or clinic seek its own legal review before relying
            on this document.
          </p>
        </section>
      </main>
    </div>
  );
}

