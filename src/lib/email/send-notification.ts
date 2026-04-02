export async function sendDocumentNotification({
  to,
  senderName,
  senderEmail,
  recipientName,
  documentName,
  documentType,
  action,
}: {
  to: string
  senderName: string
  senderEmail: string
  recipientName: string
  documentName: string
  documentType: string
  action: 'submitted' | 'approved' | 'denied' | 'released'
}) {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        recipientName,
        senderName,
        documentName,
        documentType,
        action,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Email failed:', data)
      return { success: false, error: data }
    }

    console.log('Email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email failed:', error)
    return { success: false, error }
  }
}