import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="flex items-center">
              <span className="text-xl font-bold">Write Care Notes</span>
            </div>

            <p className="mt-4 max-w-md text-gray-500 dark:text-gray-400">
              Empowering care homes with comprehensive digital solutions for resident care management.
            </p>

            <ul className="mt-8 flex gap-6">
              <li>
                <Link
                  href="/"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">Facebook</span>
                  <Facebook className="h-6 w-6" />
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-6 w-6" />
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-6 w-6" />
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-6 w-6" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Services</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Care Planning
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Medication Management
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Staff Management
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-900 dark:text-white">Company</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    About
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Meet the Team
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-900 dark:text-white">Helpful Links</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Contact
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    FAQs
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-900 dark:text-white">Legal</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Terms & Conditions
                  </Link>
                </li>

                <li>
                  <Link href="#" className="text-gray-700 transition hover:opacity-75 dark:text-gray-200">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-6 dark:border-gray-800">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="block sm:inline">All rights reserved.</span>
            </p>

            <p className="mt-4 text-sm text-gray-500 sm:order-first sm:mt-0 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Write Care Notes
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 