import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInviteEmailParams {
  to: string;
  senderName: string;
  promptText: string;
  inviteUrl: string;
}

export async function sendInviteEmail({
  to,
  senderName,
  promptText,
  inviteUrl,
}: SendInviteEmailParams) {
  const { data, error } = await resend.emails.send({
    from: "Memorybook <hello@memorybook.family>",
    to: [to],
    subject: `${senderName} wants to hear your story`,
    html: generateInviteEmailHtml({ senderName, promptText, inviteUrl }),
  });

  if (error) {
    throw error;
  }

  return data;
}

function generateInviteEmailHtml({
  senderName,
  promptText,
  inviteUrl,
}: Omit<SendInviteEmailParams, "to">) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to share a story</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                Memorybook
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #374151; text-align: center;">
                <strong>${senderName}</strong> wants to hear your story
              </p>

              <!-- Question Card -->
              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 17px; font-weight: 500; color: #111827; line-height: 1.5; text-align: center;">
                  "${promptText}"
                </p>
              </div>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${inviteUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; padding: 14px 32px; border-radius: 50px;">
                      Record a Video
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}?mode=text" style="display: inline-block; background-color: #ffffff; color: #111827; text-decoration: none; font-size: 15px; font-weight: 500; padding: 12px 30px; border-radius: 50px; border: 2px solid #e5e7eb;">
                      Write a Response
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.5;">
                This invite will expire in 7 days.<br>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>

        <!-- Bottom text -->
        <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
          Memorybook - Preserve your family's stories
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
