import { createClient } from '@/lib/supabase/client'

export type NotificationAction = 
  | 'document_submitted'
  | 'document_received'
  | 'document_approved'
  | 'document_denied'
  | 'document_forwarded'
  | 'document_released'

export async function createDocumentNotifications({
  documentId,
  documentName,
  action,
  clientId,
  sendingOfficeId,
  receivingOfficeId,
  remarks,
  sendingOfficeName,
  receivingOfficeName,
}: {
  documentId: string
  documentName: string
  action: NotificationAction
  clientId: string
  sendingOfficeId?: string
  receivingOfficeId?: string
  remarks?: string
  sendingOfficeName?: string
  receivingOfficeName?: string
}) {
  const supabase = createClient()
  const notifications = []

  // Define notification messages based on action
  const messages = {
    document_submitted: {
      client: `Your document "${documentName}" has been submitted successfully.`,
      sender: `Document "${documentName}" submitted successfully.`,
      receiver: null,
    },
    document_received: {
      client: `Your document "${documentName}" has been received by ${receivingOfficeName}.`,
      sender: null,
      receiver: `New document "${documentName}" has arrived from ${sendingOfficeName}.`,
    },
    document_approved: {
      client: `Your document "${documentName}" has been approved by ${sendingOfficeName}.`,
      sender: `You successfully approved document "${documentName}".`,
      receiver: receivingOfficeId ? `Approved document "${documentName}" has been forwarded to you.` : null,
    },
    document_denied: {
      client: `Your document "${documentName}" has been denied by ${sendingOfficeName}. Reason: ${remarks}`,
      sender: `You denied document "${documentName}".`,
      receiver: null,
    },
    document_forwarded: {
      client: `Your document "${documentName}" has been forwarded to ${receivingOfficeName}.`,
      sender: `You successfully forwarded document "${documentName}" to ${receivingOfficeName}.`,
      receiver: `New document "${documentName}" has been forwarded to you from ${sendingOfficeName}.`,
    },
    document_released: {
      client: `Your document "${documentName}" is ready for pickup!`,
      sender: `Document "${documentName}" has been released.`,
      receiver: null,
    },
  }

  const actionMessages = messages[action]

  // 1. Notification for CLIENT (document owner)
  if (actionMessages.client) {
    notifications.push({
      user_id: clientId,
      document_id: documentId,
      title: getNotificationTitle(action),
      message: actionMessages.client,
      is_read: false,
    })
  }

  // 2. Notification for SENDING OFFICE (who took the action)
  if (sendingOfficeId && actionMessages.sender) {
    notifications.push({
      user_id: sendingOfficeId,
      document_id: documentId,
      title: getNotificationTitle(action),
      message: actionMessages.sender,
      is_read: false,
    })
  }

  // 3. Notification for RECEIVING OFFICE (if document is forwarded)
  if (receivingOfficeId && actionMessages.receiver) {
    notifications.push({
      user_id: receivingOfficeId,
      document_id: documentId,
      title: 'New Document Arrived',
      message: actionMessages.receiver,
      is_read: false,
    })
  }

  // Insert all notifications
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) {
    console.error('Error creating notifications:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

function getNotificationTitle(action: NotificationAction): string {
  const titles = {
    document_submitted: 'Document Submitted',
    document_received: 'Document Received',
    document_approved: 'Document Approved',
    document_denied: 'Document Denied',
    document_forwarded: 'Document Forwarded',
    document_released: 'Document Released',
  }
  return titles[action]
}