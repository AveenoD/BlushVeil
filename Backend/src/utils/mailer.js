import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify your BlushVeil account',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
                <h2 style="color:#111">Welcome to BlushVeil 👗</h2>
                <p style="color:#555">Please verify your email address by clicking the button below. This link expires in <strong>1 hour</strong>.</p>
                <a href="${verifyUrl}" 
                   style="display:inline-block;margin:24px 0;padding:12px 28px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px">
                    Verify Email
                </a>
                <p style="color:#999;font-size:12px">If you did not create an account, ignore this email.</p>
                <p style="color:#999;font-size:12px">Or copy this link: ${verifyUrl}</p>
            </div>
        `
    })
}