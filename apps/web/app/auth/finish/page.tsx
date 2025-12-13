'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth0ToFirebase } from '@/lib/auth/auth0-to-firebase'

function FinishAuthInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    async function run() {
      const token = params.get('token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        await auth0ToFirebase(token)
        router.push('/dashboard')
      } catch (err) {
        console.error(err)
        router.push('/?error=auth_failed')
      }
    }

    run()
  }, [params, router])

  return <p>Signing you in…</p>
}

export default function FinishAuthPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <FinishAuthInner />
    </Suspense>
  )
}
