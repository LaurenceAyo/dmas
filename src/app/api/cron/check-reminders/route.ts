import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const BREVO_API_KEY = process.env.BREVO_API_KEY!

async function sendBrevoEmail(toEmail: string, toName: string, subject: string, htmlContent: string) {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: 'DMAS — Bicol University', email: 'laurenceayo7@gmail.com' },
      to: [{ email: toEmail, name: toName }],
      subject,
      htmlContent,
    }),
  })
}

function buildReminderHtml(name: string, docTitle: string, timeLeft: string): string {
  return `
    <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:#1a2e4a;padding:28px 40px;text-align:center;">
        <h1 style="color:#fff;font-size:20px;font-weight:700;margin:0;">DMAS — Document Reminder</h1>
        <p style="color:#cbd5e1;font-size:12px;margin:6px 0 0;">Bicol University Document Monitoring System</p>
      </div>
      <div style="padding:32px 40px;">
        <p style="font-size:15px;color:#374151;font-weight:600;">Hi ${name},</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.6;">
          This is a reminder that your document is still being processed.
        </p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin:20px 0;">
          <p style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin:0 0 6px;">Document</p>
          <p style="font-size:15px;color:#111827;font-weight:700;margin:0 0 12px;">${docTitle}</p>
          <span style="background:#dbeafe;color:#1d4ed8;border-radius:999px;padding:6px 16px;font-size:13px;font-weight:700;">
            ⏱ Submitted ${timeLeft} ago
          </span>
        </div>
        <p style="font-size:13px;color:#9ca3af;">Log in to DMAS to check the latest status of your document.</p>
      </div>
    </div>
    </body></html>
  `
}

export async function GET() {
  try {
    const now = new Date()

    const { data: documents } = await supabase
      .from('documents')
      .select(`
        id, title, created_at, status,
        submitted_by,
        submitter:profiles!documents_submitted_by_fkey ( id, full_name, email )
      `)
      .eq('module_type', 'process_routing')
      .not('status', 'in', '("released","denied","approved")')
      .is('completed_at', null) as { data: any[] | null }

    let sent = 0

    for (const doc of (documents ?? [])) {
      const submitter = doc.submitter as any
      if (!submitter?.email) continue

      const submittedAt = new Date(doc.created_at)
      const diffMs = now.getTime() - submittedAt.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      const diffMins = diffMs / (1000 * 60)

      // 1 day (24 hours) reminder
      if (diffHours >= 24 && diffHours < 25 && !doc.notified_1day) {
        await sendBrevoEmail(
          submitter.email,
          submitter.full_name,
          `Reminder: Your document "${doc.title}" — 1 Day Update`,
          buildReminderHtml(submitter.full_name, doc.title, '1 day')
        )
        await supabase.from('documents').update({ notified_1day: true }).eq('id', doc.id)
        sent++
      }

      // 3 hours reminder
      if (diffHours >= 3 && diffHours < 3.25 && !doc.notified_3hours) {
        await sendBrevoEmail(
          submitter.email,
          submitter.full_name,
          `Reminder: Your document "${doc.title}" — 3 Hour Update`,
          buildReminderHtml(submitter.full_name, doc.title, '3 hours')
        )
        await supabase.from('documents').update({ notified_3hours: true }).eq('id', doc.id)
        sent++
      }

      // 1 hour reminder
      if (diffMins >= 60 && diffMins < 75 && !doc.notified_1hour) {
        await sendBrevoEmail(
          submitter.email,
          submitter.full_name,
          `Reminder: Your document "${doc.title}" — 1 Hour Update`,
          buildReminderHtml(submitter.full_name, doc.title, '1 hour')
        )
        await supabase.from('documents').update({ notified_1hour: true }).eq('id', doc.id)
        sent++
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}