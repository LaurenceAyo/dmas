import { createDocumentNotifications, NotificationAction } from '@/lib/notifications/notification-service'
import { sendDocumentNotification } from '@/lib/email/send-notification'
import { createClient } from '@/lib/supabase/client'

export async function sendAllNotifications({
  documentId,
  documentName,
  documentType,
  action,
  clientId,
  sendingOfficeId,
  receivingOfficeId,
  remarks,
}: {
  documentId: string
  documentName: string
  documentType: string
  action: NotificationAction
  clientId: string
  sendingOfficeId?: string
  receivingOfficeId?: string
  remarks?: string
}) {
  const supabase = createClient()

  // Get user details from Supabase
  const { data: client } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', clientId)
    .single()

  const { data: sendingOffice } = sendingOfficeId
    ? await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sendingOfficeId)
        .single()
    : { data: null }

  const { data: receivingOffice } = receivingOfficeId
    ? await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', receivingOfficeId)
        .single()
    : { data: null }

  // 1. Create in-app notifications
  await createDocumentNotifications({
    documentId,
    documentName,
    action,
    clientId,
    sendingOfficeId,
    receivingOfficeId,
    remarks,
    sendingOfficeName: sendingOffice?.full_name || 'Office',
    receivingOfficeName: receivingOffice?.full_name || 'Office',
  })

  // 2. Send email notifications
  const emailAction = mapActionToEmailAction(action)

  // Email to client
  if (client?.email) {
    await sendDocumentNotification({
      to: client.email,
      recipientName: client.full_name,
      senderName: sendingOffice?.full_name || 'System',
      senderEmail: sendingOffice?.email || 'noreply@gmail.com',
      documentName,
      documentType,
      action: emailAction,
    })
  }

  // Email to receiving office (if forwarded)
  if (receivingOffice?.email && action === 'document_forwarded') {
    await sendDocumentNotification({
      to: receivingOffice.email,
      recipientName: receivingOffice.full_name,
      senderName: sendingOffice?.full_name || 'System',
      senderEmail: sendingOffice?.email || 'noreply@gmail.com',
      documentName,
      documentType,
      action: 'submitted', // New document for them
    })
  }

  return { success: true }
}

function mapActionToEmailAction(action: NotificationAction): 'submitted' | 'approved' | 'denied' | 'released' {
  const mapping = {
    document_submitted: 'submitted',
    document_received: 'submitted',
    document_approved: 'approved',
    document_denied: 'denied',
    document_forwarded: 'submitted',
    document_released: 'released',
  } as const

  return mapping[action]
}