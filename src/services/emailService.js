// Email service for sending various types of emails
export const sendEmail = async (options) => {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      return Promise.resolve();
    }

    // In production, integrate with email service
    // Example with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    */

    return Promise.resolve();
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

class EmailService {
  static async sendWelcomeEmail(user) {
    const message = `
      Welcome to our platform, ${user.name}!
      
      Thank you for joining our multivendor platform. You can now:
      - Browse products and services
      - Connect with vendors
      - Manage your profile
      
      If you have any questions, feel free to contact our support team.
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: user.email,
      subject: 'Welcome to Our Platform!',
      message
    });
  }

  static async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const message = `
      Hi ${user.name},
      
      You requested a password reset for your account.
      
      Please click on the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message
    });
  }

  static async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    const message = `
      Hi ${user.name},
      
      Please verify your email address by clicking the link below:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create this account, please ignore this email.
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: user.email,
      subject: 'Please Verify Your Email',
      message
    });
  }

  static async sendOrderConfirmationEmail(user, order) {
    const message = `
      Hi ${user.name},
      
      Your order has been confirmed!
      
      Order ID: ${order.id}
      Total Amount: ${order.total}
      
      You will receive updates about your order status via email.
      
      Thank you for your purchase!
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: user.email,
      subject: `Order Confirmation - ${order.id}`,
      message
    });
  }

  static async sendBookingConfirmationEmail(user, booking) {
    const message = `
      Hi ${user.name},
      
      Your booking has been confirmed!
      
      Booking ID: ${booking.id}
      Date: ${booking.date}
      Service: ${booking.service}
      
      Please save this confirmation for your records.
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: user.email,
      subject: `Booking Confirmation - ${booking.id}`,
      message
    });
  }

  static async sendEnquiryNotificationEmail(dealer, enquiry) {
    const message = `
      Hi ${dealer.name},
      
      You have received a new enquiry!
      
      Customer: ${enquiry.customerInfo.name}
      Email: ${enquiry.customerInfo.email}
      Phone: ${enquiry.customerInfo.phone}
      
      Enquiry Type: ${enquiry.enquiryType}
      Message: ${enquiry.message}
      
      Please log in to your dashboard to respond.
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: dealer.email,
      subject: 'New Enquiry Received',
      message
    });
  }

  static async sendTestDriveConfirmationEmail(customer, testDrive) {
    const message = `
      Hi ${customer.name},
      
      Your test drive has been scheduled!
      
      Vehicle: ${testDrive.vehicle}
      Date & Time: ${testDrive.scheduledDate}
      Location: ${testDrive.location}
      
      Please bring a valid driving license.
      
      Contact us if you need to reschedule.
      
      Best regards,
      The Team
    `;

    return sendEmail({
      email: customer.email,
      subject: 'Test Drive Scheduled',
      message
    });
  }
}

export default EmailService;

