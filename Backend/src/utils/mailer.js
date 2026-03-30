import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
console.log("EMAIL_USER:", process.env.EMAIL_USER)
console.log("EMAIL_PASS:", process.env.EMAIL_PASS)
await transporter.verify()
export const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`
    console.log("Verify URL:", verifyUrl)
    const mailOptions = {
        from: `"BlushVeil" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "BlushVeil — Verify Your Email",
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" 
                       style="background:#ffffff; border-radius:12px; 
                              overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#000; padding:30px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:28px;">BlushVeil</h1>
                            <p style="margin:6px 0 0 0; color:#ccc; font-size:13px;">
                                Fashion & Style Marketplace
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color:#000; margin-bottom:10px;">Verify Your Email</h2>
                            <p style="color:#555; line-height:1.6;">
                                Thank you for creating an account. Please verify your email by clicking the button below.
                            </p>

                            <!-- Button -->
                            <div style="text-align:center; margin:30px 0;">
                                <a href="${verifyUrl}" 
                                   style="display:inline-block; padding:12px 28px; background:#000; color:#fff; text-decoration:none; border-radius:8px;">
                                   Verify Email
                                </a>
                            </div>

                            <p style="color:#777; font-size:14px;">
                                This link will expire in <strong>1 hour</strong>.
                            </p>

                            <p style="color:#999; font-size:12px;">
                                Or copy this link:<br/>
                                ${verifyUrl}
                            </p>
                        </td>
                    </tr>

                    <!-- Warning -->
                    <tr>
                        <td style="padding:20px 40px;">
                            <div style="background:#fff3f3; padding:15px; border-left:4px solid red;">
                                ⚠️ If you did not create this account, please ignore this email.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8f9fa; padding:20px; text-align:center;">
                            <p style="margin:0; color:#aaa; font-size:12px;">
                                © 2026 BlushVeil. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log("✅ Verification email sent")
        return true
    } catch (error) {
        console.error("❌ Email sending failed:", error)
        throw error
    }
}