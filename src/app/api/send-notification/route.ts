import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { to, recipientName, senderName, documentName, documentType, action } = body

  const actionMessages = {
    submitted: {
      subject: `New Document Submitted: ${documentName}`,
      heading: 'New Document Received',
      message: `${senderName} has submitted a document for your review.`,
    },
    approved: {
      subject: `Document Approved: ${documentName}`,
      heading: 'Document Approved',
      message: `Your document has been approved.`,
    },
    denied: {
      subject: `Document Denied: ${documentName}`,
      heading: 'Document Denied',
      message: `Your document has been denied. Please review the remarks.`,
    },
    released: {
      subject: `Document Released: ${documentName}`,
      heading: 'Document Released',
      message: `Your document has been released and is ready for pickup.`,
    },
  }

  const { subject, heading, message } = actionMessages[action as keyof typeof actionMessages]

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'BUCENG DMS', email: 'laurenceayo7@gmail.com' },
        to: [{ email: to, name: recipientName }],
        subject,
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 24px;">BUCENG DMS</h1>
                  <p style="margin: 5px 0 0 0; color: #93c5fd; font-size: 14px;">Document Management System</p>
                </div>
                <div style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937;">${heading}</h2>
                  <p style="color: #4b5563;">Hi <strong>${recipientName}</strong>,</p>
                  <p style="color: #4b5563;">${message}</p>
                  <div style="background-color: #f9fafb; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;"><strong>Document Name:</strong> ${documentName}</p>
                    <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;"><strong>Document Type:</strong> ${documentType}</p>
                    <p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>From:</strong> ${senderName}</p>
                  </div>
                  <div style="text-align: center; margin-bottom: 20px;">
                    <a href="http://localhost:3000/login"
                       style="display: inline-block; background-color: #1e3a8a; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      View Document
                    </a>
                  </div>
                  <p style="color: #9ca3af; font-size: 14px;">This is an automated notification. Please do not reply.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">© Bicol University and its affiliates. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY!,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      }
    )
    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    console.error('Email failed:', error?.response?.data ?? error)
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}