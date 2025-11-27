import React from 'react';

// TODO: Add route in App.jsx => <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Last updated: {'{{LAST_UPDATED_DATE}}'}
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Terms &amp; Conditions</h1>
          <p className="mt-4 text-slate-300">
            These Terms &amp; Conditions govern the use of the Pre-Doctor AI platform
            provided by {'AivraSol'} . By accessing or using Pre-Doctor AI,
            you agree to these Terms. This template is a general
            reference and does not constitute legal advice. We recommend all hospital clients consult
            their own legal counsel to validate this document and adapt it to local regulations.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-6 py-12 leading-relaxed">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900">1. Introduction & Agreement</h2>
          <p className="mt-4">
            {'AivraSol'} operates Pre-Doctor AI, a multi-tenant SaaS platform that helps
            hospitals and clinics manage AI-assisted pre-assessment workflows. These Terms outline the
            rights and responsibilities of hospitals, their staff, and patients who access the
            platform. Continued use of Pre-Doctor AI indicates acceptance of these Terms.
          </p>
        </section>

        {/* Description */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">2. Description of the Service</h2>
          <p className="mt-4">
            Pre-Doctor AI enables hospitals to provide symptom intake, AI-generated summaries, and
            reporting tools. It is designed to streamline outpatient department (OPD) workflows, not to
            replace appointments with licensed medical professionals. AI outputs are suggestions and
            require clinical oversight.
          </p>
        </section>

        {/* Accounts */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">3. Accounts & User Roles</h2>
          <p className="mt-4">
            Hospitals enter into subscription agreements with {'AivraSol'}. They may create
            admin, doctor, and support accounts as needed. Patient accounts are created via hospital
            portals. Clients must ensure that account credentials are kept secure and that users act in
            accordance with hospital policies and these Terms.
          </p>
        </section>

        {/* Hospital Responsibilities */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">4. Client Responsibilities</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Provide accurate information about their staff and operations.</li>
            <li>Ensure staff review AI outputs before clinical use.</li>
            <li>
              Comply with local medical, privacy, and data protection regulations regarding patient data.
            </li>
            <li>Inform patients that pre-assessment results are not medical diagnoses.</li>
          </ul>
        </section>

        {/* AI disclaimer */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">5. AI & Clinical Disclaimer</h2>
          <p className="mt-4">
            Pre-Doctor AI provides AI-generated suggestions based on patient inputs. These suggestions
            are not medical advice, diagnoses, or treatments. {'AivraSol'} does not practice
            medicine. Hospital personnel must verify findings and use clinical judgment. Clients agree
            not to rely solely on AI outputs for patient decisions.
          </p>
        </section>

        {/* Acceptable Use */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">6. Acceptable Use</h2>
          <p className="mt-4">
            Clients must not misuse the platform. Prohibited activities include hacking, reverse
            engineering, unauthorized scraping, entering offensive or unrelated data, or using the
            system for unlawful purposes. {'AivraSol'} may suspend or terminate access for
            violations.
          </p>
        </section>

        {/* Subscription */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            7. Subscriptions, Plans & Usage Limits
          </h2>
          <p className="mt-4">
            Pre-Doctor AI is offered via SaaS subscriptions with defined AI usage quotas (pre-assessment
            checks per month). Overage charges, upgrades, and contract renewals follow the commercial
            agreements signed with each hospital.
          </p>
        </section>

        {/* IP */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">8. Intellectual Property</h2>
          <p className="mt-4">
            All software, user interface components, branding, and underlying technology remain the
            property of {'AivraSol'} or its licensors. Hospitals retain ownership of their
            patient data, content, and internal configurations. Clients receive a limited license to use
            the platform under these Terms and their commercial agreements.
          </p>
        </section>

        {/* Confidentiality */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">9. Confidentiality</h2>
          <p className="mt-4">
            {'AivraSol'} treats hospital data as confidential and implements appropriate
            safeguards. Hospitals agree to keep non-public aspects of the platform (e.g., pricing,
            roadmaps, proprietary features) confidential.
          </p>
        </section>

        {/* Availability */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">10. Availability & Maintenance</h2>
          <p className="mt-4">
            We strive to maintain continuous service but may schedule maintenance windows or experience
            interruptions due to technical issues. Unless otherwise specified in a service-level
            agreement, no guaranteed uptime is provided.
          </p>
        </section>

        {/* Warranties */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">11. Warranties & Disclaimers</h2>
          <p className="mt-4">
            Pre-Doctor AI is provided “as is” and “as available.” We do not warrant that AI outputs are
            error-free or clinically complete. Clients assume responsibility for verifying all outputs
            and using the service in accordance with medical standards.
          </p>
        </section>

        {/* Liability */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">12. Limitation of Liability</h2>
          <p className="mt-4">
            To the maximum extent permitted by law, {'AivraSol'} is not liable for indirect,
            incidental, or consequential damages, including lost profits or data. Any direct liability is
            capped at the amounts paid by the Client in the twelve (12) months preceding the relevant
            claim or as otherwise agreed in the commercial contract.
          </p>
        </section>

        {/* Indemnity */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">13. Indemnification</h2>
          <p className="mt-4">
            Clients agree to indemnify and hold harmless {'AivraSol'} from claims, damages, or
            regulatory actions arising from their misuse of the platform, violations of these Terms, or
            any failure to comply with healthcare regulations in their jurisdiction.
          </p>
        </section>

        {/* Termination */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">14. Termination & Suspension</h2>
          <p className="mt-4">
            {'AivraSol'} may suspend or terminate access for breach of these Terms, non-payment,
            or security-related concerns. Hospitals may terminate in accordance with their contracts or
            upon notice if they discontinue using the platform. Upon termination, data handling follows
            the procedures described in the Privacy Policy and applicable agreements.
          </p>
        </section>

        {/* Law */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">15. Governing Law</h2>
          <p className="mt-4">
            These Terms are governed by the laws of {'Islamic Republic of Pakistan'}. Any disputes will be resolved
            in the competent courts of that jurisdiction, unless a separate written agreement specifies
            otherwise.
          </p>
        </section>

        {/* Changes */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">16. Changes to the Terms</h2>
          <p className="mt-4">
            We may update these Terms at any time. Notice of material changes will be provided on the
            platform or via direct communication with hospital clients. Continued use after updates
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* Contact */}
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">17. Contact Information</h2>
          <p className="mt-4">
            {'AivraSol'}
            <br />
            {'aivrasol@gmail.com'}
            <br />
            Email:{' '}
            <a href="mailto:aivrasol@gmail.com" className="text-teal-600 underline">
              {'aivrasol@gmail.com'}
            </a>
          </p>
          <p className="mt-4 text-sm text-slate-500">
            These Terms are provided as a general template and do not constitute legal advice. {'AivraSol'}
            recommends that hospital clients review them with their own legal counsel before relying on
            them.
          </p>
        </section>
      </main>
    </div>
  );
}

