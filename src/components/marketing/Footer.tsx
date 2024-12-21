/**
 * WriteCareNotes.com
 * @fileoverview Marketing Footer Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import Link from 'next/link'

export function MarketingFooter() {
  const productLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/demo', label: 'Request Demo' }
  ]

  const companyLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' }
  ]

  const legalLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/gdpr-compliance', label: 'GDPR Compliance' }
  ]

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Product Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Product</h2>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-base text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Company</h2>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-base text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Legal</h2>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-base text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a 
                  href="mailto:info@writecarenotes.com"
                  className="text-base text-gray-600 hover:text-gray-900 transition-colors"
                >
                  info@writecarenotes.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:02034421373"
                  className="text-base text-gray-600 hover:text-gray-900 transition-colors"
                >
                  0203 442 1373
                </a>
              </li>
              <li className="text-base text-gray-600">
                4th Floor Silverstream House<br />
                45 Fitzroy Street<br />
                Fitzrovia, London<br />
                W1T 6EB
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}