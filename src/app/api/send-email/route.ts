import { NextResponse } from 'next/server'
import { sendDocumentNotification } from '@/lib/email/send-notification'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { to, senderName, senderEmail, recipientName, documentName, documentType, action } = body

    if (!to || !documentName || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const result = await sendDocumentNotification({
      to,
      senderName: senderName || 'User',
      senderEmail: senderEmail || 'noreply@gmail.com',
      recipientName: recipientName || 'Office Head',
      documentName,
      documentType: documentType || 'Document',
      action,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}