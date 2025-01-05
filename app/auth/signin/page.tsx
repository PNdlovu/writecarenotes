/**
 * WriteCareNotes.com
 * @fileoverview Sign In Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import SignInForm from '@/components/auth/SignInForm'
import { AuthTopBar } from '@/components/navigation/AuthTopBar'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AuthTopBar />
      
      <main className="flex flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-8 shadow-xl shadow-gray-900/10 sm:rounded-lg sm:px-12">
            <SignInForm />
          </div>
        </div>
      </main>

      <footer className="py-8">
        <div className="mx-auto max-w-7xl px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact Support
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} WriteCareNotes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
