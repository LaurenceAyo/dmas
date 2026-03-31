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
function buildEmailHtml(
  name: string,
  docTitle: string,
  message: string,
  daysLeft: number,
  isOverdue: boolean,
  isPaused: boolean = false,
  isResumed: boolean = false
): string {
  // 1. Dynamic Colors based on Urgency
  const primaryColor = isOverdue ? '#dc2626'   // Deep Red
    : daysLeft === 1             ? '#ea580c'   // Urgent Orange
    : isPaused                   ? '#6b7280'   // Neutral Gray
    : isResumed                  ? '#2563eb'   // Active Blue
    : '#0f172a';                               // Dark Navy (Default)

  const lightBg = isOverdue      ? '#fef2f2'   // Light Red tint
    : daysLeft === 1             ? '#fff7ed'   // Light Orange tint
    : isPaused                   ? '#f3f4f6'   // Light Gray tint
    : isResumed                  ? '#eff6ff'   // Light Blue tint
    : '#f8fafc';                               // Slate tint

  const badgeLabel = isOverdue   ? '🚨 OVERDUE'
    : daysLeft === 1             ? '⚠️ Due Tomorrow'
    : isPaused                   ? '⏸️ Timer Paused'
    : isResumed                  ? '▶️ Timer Resumed'
    : `✅ ${daysLeft} Working Days Left`;

  // 2. Email Client Compatible HTML (Using Tables)
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          
          <!-- Main Card -->
          <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            
            <!-- Header -->
            <tr>
              <td style="background-color: ${primaryColor}; padding: 32px 40px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">DMAS Alert</h1>
                <p style="color: #ffffff; font-size: 14px; margin: 8px 0 0 0; opacity: 0.9;">Bicol University Document Monitoring System</p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="font-size: 16px; color: #111827; font-weight: 600; margin: 0 0 16px 0;">Hi ${name},</p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 32px 0;">
                  ${message}
                </p>

                <!-- Document Details Box -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${lightBg}; border: 1px solid ${primaryColor}40; border-radius: 8px; padding: 24px;">
                  <tr>
                    <td>
                      <p style="font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Document Name</p>
                      <p style="font-size: 18px; color: #111827; font-weight: bold; margin: 0 0 24px 0;">${docTitle}</p>
                      
                      <p style="font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">ARTA Status</p>
                      <div>
                        <!-- Fallback badge for email compatibility -->
                        <span style="display: inline-block; background-color: #ffffff; border: 2px solid ${primaryColor}; color: ${primaryColor}; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                          ${badgeLabel}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>

        

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
                  This is an automated ARTA compliance alert from DMAS — Bicol University.<br>
                  Please do not reply directly to this email.
                </p>
              </td>
            </tr>

          </table>
          
        </td>
      </tr>
    </table>
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