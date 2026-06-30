export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <a href="/marketplace" className="text-xs text-slate-400 hover:text-sky-300">← Back to marketplace</a>
        <h1 className="mt-6 text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-xs text-slate-400">Last updated: June 2025</p>

        <div className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">1. About Student Hub</h2>
            <p>Student Hub is a peer-to-peer marketplace for students at Irish third-level institutions to buy and sell second-hand goods. We connect buyers and sellers but are not a party to any transaction.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">2. Eligibility</h2>
            <p>You must be a current student at a recognised Irish third-level institution and sign up with a valid college email address. By registering, you confirm this is the case.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">3. Your listings</h2>
            <p>You are solely responsible for the accuracy of your listings. You must only list items you own and have the right to sell. Prohibited items include but are not limited to: illegal goods, prescription medication, weapons, counterfeit items, and adult content.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">4. Transactions</h2>
            <p>All transactions are between buyers and sellers directly. Student Hub does not handle payments, provide buyer or seller protection, or guarantee the quality, safety, or legality of any item listed. Meet in safe public places and use cash or trusted payment methods only.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">5. Acceptable use</h2>
            <p>You agree not to use Student Hub to spam, harass, or defraud other users; to post false or misleading listings; to attempt to access other users' accounts; or to use the platform for any unlawful purpose.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">6. Account termination</h2>
            <p>We reserve the right to suspend or delete accounts that violate these terms, without notice. You may request deletion of your account and data at any time by emailing us.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">7. Limitation of liability</h2>
            <p>Student Hub is provided as-is. We are not liable for any loss or damage arising from your use of the platform, transactions between users, or the actions of other users.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">8. Changes</h2>
            <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">9. Governing law</h2>
            <p>These terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the Irish courts.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">10. Contact</h2>
            <p>Questions? Email us at <span className="text-sky-300">support@student-superapp.vercel.app</span></p>
          </section>
        </div>
      </main>
    </div>
  );
}
