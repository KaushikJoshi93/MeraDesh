// Generate a random reset token
export const generateResetToken = (length) => {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};

// Send a reset password email (optional)
export const sendResetPasswordEmail = async (email, resetToken) => {
    // const transporter = nodemailer.createTransport({
    // });

    // const mailOptions = {
    //     from: '"App Name" <email@example.com>', 
    //     to: email,
    //     subject: 'Reset Your Password',
    //     text: `You have requested to reset your password for your account. Please click on the following link to set a new password: \n\n http://your-app-domain.com/reset-password/${resetToken} \n\n This link will expire in 1 hour.`,
    // };

    // try {
    //     await transporter.sendMail(mailOptions);
    // } catch (err) {
    //     console.error('Error sending email:', err);
    // }
    return true;
};
