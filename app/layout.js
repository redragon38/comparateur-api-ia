import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — comparateur d'API IA`,
    template: `%s | ${SITE_NAME}`
  },
  description: DEFAULT_DESCRIPTION,
  robots: { index: true, follow: true },
  referrer: 'strict-origin-when-cross-origin',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME
  }
};

export const viewport = {
  themeColor: '#7c3aed',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SEWMBXBBZW" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SEWMBXBBZW');
            `,
          }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
