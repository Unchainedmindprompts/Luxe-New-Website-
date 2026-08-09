import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";

/**
 * Privacy policy.
 *
 * Written against what this site actually does rather than from a template:
 * the three forms and their exact fields, Resend for delivery, and the four
 * third parties that load in the browser — Meta Pixel, Microsoft Clarity,
 * Vercel Analytics, and Calendly on /book. Clarity records sessions, which is
 * the one most visitors would not guess, so it is named explicitly.
 *
 * If a tracker is added or removed from app/layout.tsx, this page needs the
 * matching edit. A policy that lists things the site no longer does, or omits
 * things it does, is worse than none.
 */

const PAGE_URL = `${BUSINESS.url}/privacy`;
const EFFECTIVE = "August 4, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | Luxe Window Works",
  description:
    "How Luxe Window Works collects, uses, and protects information from visitors to luxewindowworks.com — including what our contact forms collect and which third-party services we use.",
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Privacy Policy — Luxe Window Works",
  description:
    "How Luxe Window Works collects, uses, and protects visitor information.",
  isPartOf: { "@id": `${BUSINESS.url}/#website` },
  about: { "@id": `${BUSINESS.url}/#business` },
  inLanguage: "en-US",
  datePublished: "2026-08-04",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-charcoal mb-4">{title}</h2>
      <div className="space-y-4 text-warm-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

const EXTERNAL = "text-gold hover:text-gold-dark underline underline-offset-2";

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

      <div className="bg-warm-white">
        <div className="container-luxe max-w-3xl py-16 md:py-20">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-warm-gray-500">
            Effective {EFFECTIVE}
          </p>
          <p className="mt-6 text-lg text-warm-gray-600 leading-relaxed">
            This policy covers luxewindowworks.com, operated by Luxe Window
            Works LLC in Post Falls, Idaho. It describes what we collect, why,
            and who else sees it. We have tried to write it in plain language
            rather than legal boilerplate.
          </p>

          <Section title="What you give us">
            <p>
              Three places on this site ask for information: the contact form,
              the consultation request on the booking page, and the
              &ldquo;have Luxe contact me&rdquo; form on our window-treatment
              advisor page. Between them they collect your <strong>name, phone
              number, email address, street address, city, a description of what
              you need</strong>, and how you would prefer to be contacted. The
              advisor&rsquo;s form is the shortest of the three: a name, a phone
              number, an email address if you want to give one, and anything you
              choose to add.
            </p>
            <p>
              We ask for the address because we come to your home to measure. We
              ask for the rest so we can reach you and arrive prepared. None of
              it is required to browse the site, and we do not sell any of it.
            </p>
            <p>
              Form submissions are delivered to our own inbox by{" "}
              <a href="https://resend.com/legal/privacy-policy" className={EXTERNAL} rel="noopener" target="_blank">Resend</a>,
              an email delivery service. They handle the message in transit.
            </p>
          </Section>

          <Section title="What gets collected automatically">
            <p>
              Like most websites, ours records basic technical information when
              you visit: your approximate location (from your IP address),
              browser and device type, which pages you viewed, and which site
              you arrived from. This is standard web traffic data and we use it
              to understand what people find useful.
            </p>
            <p>
              One of our tools deserves a specific mention.{" "}
              <strong>Microsoft Clarity records browsing sessions</strong> —
              mouse movement, scrolling, clicks, and which parts of a page hold
              attention. It is how we learn that, for instance, nobody scrolls
              past a certain section. It does not capture what you type into
              form fields, and we use it to improve the site, not to identify
              individuals.
            </p>
          </Section>

          <Section title="The window-treatment advisor">
            <p>
              Our{" "}
              <Link href="/ask-luxe" className="text-gold underline underline-offset-2">
                Find the Right Window Treatments
              </Link>{" "}
              page lets you describe your project in your own words and get
              suggestions back. It is AI-assisted, and here is exactly what that
              means for your information.
            </p>
            <p>
              <strong>What is sent.</strong> The messages you type, and the
              structured project details we work out from them — things like the
              room, which way the windows face, and what matters most to you.
              The advisor never asks for your name, phone number, email or
              address to answer you, and none of those are ever sent to the AI
              provider.
            </p>
            <p>
              <strong>What we keep of the conversation.</strong> Nothing. There
              is no database behind the advisor and we do not store or log what
              you type into it. While you are using it, the conversation lives
              in your own browser and is passed back to our server with each
              message so it can follow the thread. Close the tab and it is gone.
              Anthropic&rsquo;s own handling of what it receives is covered by
              their privacy policy, linked below. This applies to the
              conversation only &mdash; anything you deliberately send us
              through a form is different, and we do receive and keep that.
            </p>
            <p>
              <strong>If you ask us to contact you.</strong> The page offers a
              short form for a call back instead of booking a time yourself.
              That is the only place it asks for contact details, and it is
              entirely your choice. What you enter is emailed to our team along
              with the product direction discussed, what you said matters most,
              and anything you type in that form — never your conversation,
              which is not sent with it and is still not stored. Those details
              go to us, not to the AI provider.
            </p>
            <p>
              <strong>What it is, and is not.</strong> The advisor gives
              guidance, not a quote, a measurement or a commitment. Product
              suitability, fit, mounting and final pricing all depend on your
              actual windows, which is why we confirm them during the in-home
              consultation. Nothing the advisor says is binding on us or on you.
            </p>
            <p>
              <strong>You never have to use it.</strong> You can{" "}
              <Link href="/book" className="text-gold underline underline-offset-2">
                book a free in-home consultation
              </Link>{" "}
              directly, or call or email us, without going near the advisor.
            </p>
          </Section>

          <Section title="Third-party services we use">
            <p>These services run on our site and receive some data directly:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Microsoft Clarity</strong> — session recording and
                heatmaps.{" "}
                <a href="https://privacy.microsoft.com/privacystatement" className={EXTERNAL} rel="noopener" target="_blank">Privacy statement</a>
              </li>
              <li>
                <strong>Meta Pixel (Facebook)</strong> — measures whether our
                Facebook and Instagram advertising reaches people who then visit
                us, and may be used to show you our ads later.{" "}
                <a href="https://www.facebook.com/privacy/policy" className={EXTERNAL} rel="noopener" target="_blank">Privacy policy</a>
              </li>
              <li>
                <strong>Vercel Analytics</strong> — page view counts and
                performance. Privacy-focused and does not use cookies to track
                you across sites.{" "}
                <a href="https://vercel.com/legal/privacy-policy" className={EXTERNAL} rel="noopener" target="_blank">Privacy policy</a>
              </li>
              <li>
                <strong>Anthropic</strong> — provides the AI that powers the
                window-treatment advisor on our{" "}
                <Link href="/ask-luxe" className="text-gold underline underline-offset-2">
                  Find the Right Window Treatments
                </Link>{" "}
                page. When you use the advisor, the messages you type there, and
                the project details we derive from them, are sent to Anthropic to
                be processed and answered.{" "}
                <a href="https://www.anthropic.com/legal/privacy" className={EXTERNAL} rel="noopener" target="_blank">Privacy policy</a>
              </li>
              <li>
                <strong>Calendly</strong> — powers the appointment scheduler on
                our booking page. If you book through it, Calendly receives the
                name, email, and any details you enter there.{" "}
                <a href="https://calendly.com/legal/privacy-notice" className={EXTERNAL} rel="noopener" target="_blank">Privacy notice</a>
              </li>
            </ul>
            <p>
              Our site is hosted by Vercel, which keeps standard server logs.
              Beyond the services listed above, we do not share your information
              with anyone — no data brokers, no lead-selling, no mailing lists.
            </p>
          </Section>

          <Section title="Cookies and how to opt out">
            <p>
              The services above set cookies or similar identifiers. You can
              clear or block them in your browser settings, and doing so will
              not stop you using this site — the forms and the scheduler will
              still work.
            </p>
            <p>
              To limit specific tools:{" "}
              <a href="https://www.clarity.ms/en/opt-out/" className={EXTERNAL} rel="noopener" target="_blank">opt out of Microsoft Clarity</a>,
              adjust{" "}
              <a href="https://www.facebook.com/settings?tab=ads" className={EXTERNAL} rel="noopener" target="_blank">your Meta ad preferences</a>,
              or turn on your browser&apos;s Do Not Track or tracking-prevention
              setting.
            </p>
          </Section>

          <Section title="How long we keep things">
            <p>
              Consultation and contact enquiries stay in our email and customer
              records for as long as we might reasonably need them — to quote a
              job, honour a warranty, or answer a question about work we did.
              Analytics data is retained by each provider under their own
              schedules, generally between one and two years.
            </p>
          </Section>

          <Section title="Your choices">
            <p>
              You can ask us what information we hold about you, ask us to
              correct it, or ask us to delete it. Email{" "}
              <a href={`mailto:${BUSINESS.email}`} className={EXTERNAL}>{BUSINESS.email}</a>{" "}
              or call{" "}
              <a href={BUSINESS.phoneHref} className={EXTERNAL}>{BUSINESS.phone}</a>{" "}
              and we will handle it. We will not ask why.
            </p>
            <p>
              Depending on where you live, you may have additional rights under
              laws such as the California Consumer Privacy Act. We honour those
              requests regardless of where you live, because it is simpler and
              fairer than checking first.
            </p>
          </Section>

          <Section title="Children">
            <p>
              This site is meant for adults arranging work on their homes. We do
              not knowingly collect information from anyone under 13. If you
              believe a child has sent us information, contact us and we will
              remove it.
            </p>
          </Section>

          <Section title="Security">
            <p>
              The site is served entirely over HTTPS, and form submissions are
              encrypted in transit. No system is perfectly secure, but we do not
              store payment details on this website, and we keep the amount of
              personal information we hold to what a window treatment job
              actually requires.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If we add or remove a service that handles visitor data, we update
              this page and change the effective date at the top. There is no
              mailing list for policy updates — the date is the record.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Luxe Window Works LLC
              <br />
              {BUSINESS.address.full}
              <br />
              <a href={`mailto:${BUSINESS.email}`} className={EXTERNAL}>{BUSINESS.email}</a>
              <br />
              <a href={BUSINESS.phoneHref} className={EXTERNAL}>{BUSINESS.phone}</a>
            </p>
            <p className="pt-4">
              <Link href="/contact" className={EXTERNAL}>
                Contact us
              </Link>{" "}
              with any question about this policy.
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}
