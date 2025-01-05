'use client'

import { Button } from '@/components/ui/Button/Button'

export default function TestPage() {
  const testOrg = async () => {
    try {
      const response = await fetch('/api/auth/test-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'org',
          data: {
            organization: 'Phibu Cloud Solutions Ltd',
            region: 'ENGLAND'
          }
        })
      })
      const data = await response.json()
      console.log('Organization test result:', data)
    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  const testUser = async (orgId: string) => {
    try {
      const response = await fetch('/api/auth/test-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'user',
          data: {
            email: 'philani.ndlovu1@outlook.com',
            password: 'JaydenMalime@2015',
            firstName: 'philani',
            lastName: 'Ndlovu',
            organization: orgId
          }
        })
      })
      const data = await response.json()
      console.log('User test result:', data)
    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  const testStaff = async (userId: string, orgId: string) => {
    try {
      const response = await fetch('/api/auth/test-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'staff',
          data: {
            email: userId,
            organization: orgId
          }
        })
      })
      const data = await response.json()
      console.log('Staff test result:', data)
    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Signup Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Step 1: Create Organization</h2>
          <Button onClick={testOrg}>
            Test Organization Creation
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Step 2: Create User</h2>
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Organization ID from step 1"
              className="px-3 py-2 border rounded"
              id="orgId"
            />
            <Button onClick={() => {
              const orgId = (document.getElementById('orgId') as HTMLInputElement).value
              testUser(orgId)
            }}>
              Test User Creation
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Step 3: Create Staff</h2>
          <div className="space-y-2">
            <div>
              <input 
                type="text" 
                placeholder="User ID from step 2"
                className="px-3 py-2 border rounded w-full"
                id="userId"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Organization ID from step 1"
                className="px-3 py-2 border rounded"
                id="staffOrgId"
              />
              <Button onClick={() => {
                const userId = (document.getElementById('userId') as HTMLInputElement).value
                const orgId = (document.getElementById('staffOrgId') as HTMLInputElement).value
                testStaff(userId, orgId)
              }}>
                Test Staff Creation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Test Organization Creation" and check the browser console (F12)</li>
          <li>Copy the organization ID from the console output</li>
          <li>Paste the organization ID into the input field in step 2</li>
          <li>Click "Test User Creation" and check the console</li>
          <li>Copy the user ID from the console output</li>
          <li>Paste both IDs into the step 3 input fields</li>
          <li>Click "Test Staff Creation" and check the console</li>
        </ol>
      </div>
    </div>
  )
}
