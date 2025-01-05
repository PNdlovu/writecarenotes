import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://writecarenotes.com'),
  title: 'Care Home Blog | Write Care Notes',
  description: 'Stay updated with the latest care home regulations, best practices, and industry insights.',
  openGraph: {
    type: 'website',
    title: 'Care Home Blog | Write Care Notes',
    description: 'Stay updated with the latest care home regulations, best practices, and industry insights.',
    siteName: 'Write Care Notes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Care Home Blog | Write Care Notes',
    description: 'Stay updated with the latest care home regulations, best practices, and industry insights.',
  }
}; 
