import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Next.js uses process.env instead of Deno.env
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BREVO_API_KEY  = process.env.BREVO_API_KEY!
const FROM_EMAIL     = 'laurenceayo7@gmail.com' 
const FROM_NAME      = 'DMAS — Bicol University'

// ── Working Days Left Calculator ──────────────────────────────────────────
function workingDaysLeft(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due <= today) return 0

  let count = 0
  const current = new Date(today)
  while (current < due) {
    current.setDate(current.getDate() + 1)
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
  }
  return count
}

// ── Send Email via Brevo ──────────────────────────────────────────────────
async function sendBrevoEmail(toEmail: string, toName: string, subject: string, htmlContent: string) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key':      BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender:      { name: FROM_NAME, email: FROM_EMAIL },
        to:          [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`Brevo error for ${toEmail}:`, err)
    }
  } catch (err) {
    console.error('Brevo send failed:', err)
  }
}

// ── Email HTML Builder ────────────────────────────────────────────────────
function buildEmailHtml(name: string, docTitle: string, message: string, daysLeft: number, isOverdue: boolean): string {
  const headerColor = isOverdue ? '#dc2626' : daysLeft === 1 ? '#d97706' : '#1a2e4a'
  const badgeLabel = isOverdue ? '🚨 OVERDUE' : daysLeft === 1 ? '⚠️ Due Tomorrow' : `✅ ${daysLeft} Working Days Left`

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:${headerColor};padding:28px 40px;text-align:center;">
          <h1 style="color:#fff;font-size:20px;font-weight:700;margin:0;">DMAS — ARTA Alert</h1>
          <p style="color:#cbd5e1;font-size:12px;margin:6px 0 0;">Bicol University Document Monitoring System</p>
        </div>
        <div style="padding:32px 40px;">
          <p style="font-size:15px;color:#374151;font-weight:600;margin:0 0 8px;">Hi ${name},</p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">${message}</p>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Document</p>
            <p style="font-size:15px;color:#111827;font-weight:700;margin:0 0 16px;">${docTitle}</p>
            <span style="display:inline-block;background:${headerColor}20;color:${headerColor};border:1px solid ${headerColor}40;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:700;">
              ${badgeLabel}
            </span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// ── Send In-App + Email to a User ─────────────────────────────────────────
async function notifyUser(supabase: any, userId: string, userEmail: string, userName: string, documentId: string, documentTitle: string, notifTitle: string, notifMessage: string, emailSubject: string, emailHtml: string) {
  await supabase.from('notifications').insert([{
    user_id:     userId,
    document_id: documentId,
    title:       notifTitle,
    message:     notifMessage,
    is_read:     false,
  }])
  await sendBrevoEmail(userEmail, userName, emailSubject, emailHtml)
}

// ── Next.js API GET Handler ───────────────────────────────────────────────
export async function GET(request: Request) {
  // Use Service Role to bypass RLS for background jobs
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        id, title, due_date, status,
        paused_at, completed_at,
        notified_3days, notified_1day, notified_overdue,
        submitted_by, current_office_id,
        submitter:profiles!documents_submitted_by_fkey ( id, full_name, email ),
        current_office:departments!documents_current_office_id_fkey ( id, name )
      `)
      .eq('module_type', 'process_routing')
      .is('completed_at', null)
      .is('paused_at', null)
      .not('due_date', 'is', null)
      .not('status', 'in', '("released","denied")')

    if (error) throw error

    const { data: superAdmins } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'super_admin')

    let notificationsSent = 0

    for (const doc of (documents ?? [])) {
      const daysLeft  = workingDaysLeft(doc.due_date)
      const isOverdue = daysLeft === 0
      const is1Day    = daysLeft === 1
      const is3Days   = daysLeft === 3
      const submitter = doc.submitter as any
      const office    = doc.current_office as any

      const { data: officeHead } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('department_id', doc.current_office_id)
        .eq('role', 'office_head')
        .single()

      // ── 3 Days Warning ──
      if (is3Days && !doc.notified_3days) {
        const subject = `⚠️ ARTA Alert: "${doc.title}" — 3 Working Days Left`
        
        if (officeHead?.id) {
          await notifyUser(supabase, officeHead.id, officeHead.email, officeHead.full_name, doc.id, doc.title, '⚠️ ARTA Deadline', `Document "${doc.title}" is due in 3 days.`, subject, buildEmailHtml(officeHead.full_name, doc.title, `The document "<strong>${doc.title}</strong>" is due in <strong>3 working days</strong>.`, 3, false))
        }
        for (const admin of (superAdmins ?? [])) {
          await notifyUser(supabase, admin.id, admin.email, admin.full_name, doc.id, doc.title, '⚠️ ARTA Deadline', `Document "${doc.title}" at ${office?.name} is due in 3 days.`, subject, buildEmailHtml(admin.full_name, doc.title, `Document "<strong>${doc.title}</strong>" at <strong>${office?.name}</strong> is due in 3 days.`, 3, false))
        }

        await supabase.from('documents').update({ notified_3days: true }).eq('id', doc.id)
        notificationsSent++
      }

      // ── 1 Day Warning ──
      if (is1Day && !doc.notified_1day) {
        const subject = `🚨 ARTA URGENT: "${doc.title}" — Due Tomorrow!`
        
        if (officeHead?.id) {
          await notifyUser(supabase, officeHead.id, officeHead.email, officeHead.full_name, doc.id, doc.title, '🚨 ARTA Deadline', `URGENT: "${doc.title}" is due TOMORROW.`, subject, buildEmailHtml(officeHead.full_name, doc.title, `⚠️ URGENT: The document "<strong>${doc.title}</strong>" is due <strong>TOMORROW</strong>.`, 1, false))
        }
        for (const admin of (superAdmins ?? [])) {
          await notifyUser(supabase, admin.id, admin.email, admin.full_name, doc.id, doc.title, '🚨 ARTA Deadline', `URGENT: "${doc.title}" at ${office?.name} is due tomorrow!`, subject, buildEmailHtml(admin.full_name, doc.title, `⚠️ URGENT: Document "<strong>${doc.title}</strong>" at <strong>${office?.name}</strong> is due tomorrow!`, 1, false))
        }

        await supabase.from('documents').update({ notified_1day: true }).eq('id', doc.id)
        notificationsSent++
      }

      // ── OVERDUE ──
      if (isOverdue && !doc.notified_overdue) {
        const subject = `🚨 ARTA OVERDUE: "${doc.title}" — Immediate Action Required`
        
        if (submitter?.id) {
          await notifyUser(supabase, submitter.id, submitter.email, submitter.full_name, doc.id, doc.title, '🚨 Document OVERDUE', `Your document "${doc.title}" has exceeded its deadline.`, subject, buildEmailHtml(submitter.full_name, doc.title, `Your document "<strong>${doc.title}</strong>" has exceeded its processing deadline.`, 0, true))
        }
        if (officeHead?.id) {
          await notifyUser(supabase, officeHead.id, officeHead.email, officeHead.full_name, doc.id, doc.title, '🚨 Document OVERDUE', `RISK: "${doc.title}" is OVERDUE!`, subject, buildEmailHtml(officeHead.full_name, doc.title, `🚨 RISK: The document "<strong>${doc.title}</strong>" is now <strong>OVERDUE</strong>.`, 0, true))
        }
        for (const admin of (superAdmins ?? [])) {
          await notifyUser(supabase, admin.id, admin.email, admin.full_name, doc.id, doc.title, '🚨 Document OVERDUE', `RISK: "${doc.title}" at ${office?.name} is OVERDUE!`, subject, buildEmailHtml(admin.full_name, doc.title, `🚨 RISK: Document "<strong>${doc.title}</strong>" at <strong>${office?.name}</strong> is OVERDUE!`, 0, true))
        }

        await supabase.from('documents').update({ notified_overdue: true }).eq('id', doc.id)
        notificationsSent++
      }
    }

    return NextResponse.json({ success: true, notifications_sent: notificationsSent })

  } catch (error: any) {
    console.error('Fetch error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}