import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {

      // Get role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = profile?.role ?? 'client'

      const redirectMap: Record<string, string> = {
        super_admin: '/super-admin/dashboard',
        office_head: '/office-head/dashboard',
        client: '/client/dashboard',
      }

      return NextResponse.redirect(`${origin}${redirectMap[role]}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}