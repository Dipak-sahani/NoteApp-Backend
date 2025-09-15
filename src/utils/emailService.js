// utils/emailService.js (add this function)
export const sendWelcomeEmail = async (email, userName, companyName, loginLink, temporaryPassword) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Welcome to ${companyName} on NotesApp`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ${companyName}'s NotesApp!</h2>
        <p>Hello ${userName},</p>
        <p>Your administrator has created an account for you on the ${companyName} NotesApp platform.</p>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your login credentials:</strong></p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        
        <p><strong>For security reasons, you will be required to change your password on first login.</strong></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${loginLink}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};