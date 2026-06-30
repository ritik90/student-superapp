export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <a href="/marketplace" className="text-xs text-slate-400 hover:text-sky-300">Back to marketplace</a>
        <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-xs text-slate-400">Last updated: June 2025</p>
        <div className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">1. Who we are</h2>
            <p>Student Hub is operated as a student project. For privacy matters, contact us at support@student-superapp.vercel.app</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">2. What data we collect</h2>
            <p>We collect your college email address and name when you register. When you create a listing we store the listing content including photos, your location choice, and optionally a phone number you choose to share. We store messages sent between users. We do not collect payment information.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">3. Why we collect it</h2>
            <p>Your email is used to verify you are a current student and to send a confirmation link. Your name and listing data are shown to other users so they can contact you about items. Messages are stored so both parties can see the conversation history.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">4. Legal basis (GDPR)</h2>
            <p>We process your data on the basis of your consent given when you register and our legitimate interest in operating the platform. You may withdraw consent at any time by requesting account deletion.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">5. Who we share data with</h2>
            <p>Your listing data and optional phone number are visible to other registered students. We use Supabase (EU-hosted, Ireland region) for database and file storage, and Vercel for hosting. We do not sell your data to third parties.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">6. How long we keep it</h2>
            <p>We keep your data for as long as your account is active. If you request deletion we will remove your account, listings, and messages within 30 days.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">7. Your rights</h2>
            <p>Under GDPR you have the right to access, correct, and request deletion of your data, and to object to processing. Email us and we will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">8. Cookies</h2>
            <p>We use a single session cookie to keep you logged in. We do not use advertising or tracking cookies.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-100 mb-2">9. Contact</h2>
            <p>For any privacy questions: support@student-superapp.vercel.app</p>
            <p className="mt-1">You also have the right to lodge a complaint with the Data Protection Commission Ireland at www.dataprotection.ie</p>
          </section>
        </div>
      </main>
    </div>
  );
}
