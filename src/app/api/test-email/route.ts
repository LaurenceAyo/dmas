import { NextResponse } from 'next/server'
import { sendDocumentNotification } from '@/lib/email/send-notification'

export async function GET() {
  const result = await sendDocumentNotification({
    to: 'fluffypants2552@gmail.com',
    senderName: 'John Doe',
    senderEmail: 'sender@test.com',
    recipientName: 'Dr. Bogart',
    documentName: 'Test Document',
    documentType: 'Financial Document',
    action: 'submitted',
  })

  return NextResponse.json(result)
}