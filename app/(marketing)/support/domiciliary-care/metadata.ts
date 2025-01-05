import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://writecarenotes.com'),
  title: 'Domiciliary Care Services | Write Care Notes',
  description: 'Professional care services delivered in the comfort of your own home, supporting independence and quality of life.',
  keywords: 'domiciliary care, home care, personal care, medication support, household support',
  openGraph: {
    type: 'website',
    title: 'Domiciliary Care Services | Write Care Notes',
    description: 'Professional care services delivered in the comfort of your own home, supporting independence and quality of life.',
    siteName: 'Write Care Notes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domiciliary Care Services | Write Care Notes',
    description: 'Professional care services delivered in the comfort of your own home, supporting independence and quality of life.',
  }
}; 
