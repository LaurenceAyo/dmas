import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    documentId, documentName, action,
    clientId, sendingOfficeId, receivingOfficeId,
    remarks, sendingOfficeName, receivingOfficeName,
  } = body

  const supabase = await createClient()

  const actionMessages: Record<string, { title: string; message: string }> = {
    document_submitted: {
      title: 'Document Submitted',
      message: `Your document "${documentName}" has been received and is now being processed.`,
    },
    document_received: {
      title: 'Document Received',
      message: `Your document "${documentName}" has been received by ${receivingOfficeName}.`,
    },
    document_approved: {
      title: 'Document Approved',
      message: `Your document "${documentName}" has been approved.`,
    },
    document_denied: {
      title: 'Document Denied',
      message: `Your document "${documentName}" has been denied. Remarks: ${remarks || 'No remarks.'}`,
    },
    document_released: {
      title: 'Document Released',
      message: `Your document "${documentName}" has been released and is ready for pickup.`,
    },
    document_forwarded: {
      title: 'Document Forwarded',
      message: `Your document "${documentName}" has been forwarded to ${receivingOfficeName}.`,
    },
  }

  const notif = actionMessages[action]
  if (!notif) {
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  }

  const { error } = await supabase.from('notifications').insert([{
    user_id:     clientId,
    document_id: documentId,
    title:       notif.title,
    message:     notif.message,
    is_read:     false,
  }])

  if (error) {
    console.error('Notification insert failed:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}