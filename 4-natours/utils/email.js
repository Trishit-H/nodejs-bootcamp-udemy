const nodemailer = require('nodemailer');

/**
 * Sends an email using a configured SMTP transporter.
 * This function sets up the transporter (using environment variables for security),
 * defines email options, and sends the email using `nodemailer`.
 * Primarily used for sending transactional emails such as password reset links.
 * MailTrap or a similar service can be used for testing email appearance before production.
 *
 * @param {Object} options - Email options (recipient email, subject, message).
 * @returns {Promise} - Resolves when email is sent or throws an error if it fails.
 */

const sendEmail = async (options) => {
  // 1) Create a transporter
  // The transporter is an object that handles the actual email sending process.
  // We configure the transporter to use SMTP settings provided by MailTrap (or another email service in production).
  // MailTrap is commonly used for testing emails as it captures them in a virtual inbox without actually sending.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // SMTP host from environment variables, for security and configurability
    port: process.env.EMAIL_PORT, // SMTP port from environment variables (e.g., MailTrap's port, usually 2525)
    auth: {
      // Authentication credentials for SMTP service
      user: process.env.EMAIL_USERNAME, // Email username from environment variables
      pass: process.env.EMAIL_PASSWORD, // Email password from environment variables
    },
  });

  // 2) Define email options
  // Setting up details of the email, including sender, recipient, subject, and content
  const mailOptions = {
    from: 'Trishit Hazra <hello@trishit.io>', // Sender's name and email address displayed in the inbox
    to: options.email, // Recipient's email, provided via the function's options parameter
    subject: options.subject, // Subject line of the email
    text: options.message, // Email content in plain text (useful for accessibility and email compatibility)
  };

  // 3) Actually send the email
  // The `sendMail` function sends the email based on the defined `mailOptions`.
  // This is an asynchronous operation, as the email sending process may take some time to complete.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
