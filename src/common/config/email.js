const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Provider Factory
 * Easily switch email providers by changing EMAIL_PROVIDER env variable
 * Supported: 'brevo', 'smtp', 'gmail', 'sendgrid'
 */
const createTransporter = () => {
  const provider = process.env.EMAIL_PROVIDER || 'brevo';

  switch (provider) {
    case 'brevo':
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_SMTP_KEY,
        },
      });

    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });

    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

    case 'smtp':
    default:
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'SkillBridge'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed to ${to}:`, error);
    throw error;
  }
};

module.exports = { sendEmail };
