import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { authConfig } from './config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getCurrentUser() {
  const session = await getServerSession(authConfig) as Session | null
  return session?.user
}

export async function isAuthenticated() {
  const session = await getServerSession(authConfig)
  return !!session
} 


