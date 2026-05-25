const nodemailer = require('nodemailer');
const logger = require('../../../utils/logger');

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT || 587),
	secure: process.env.SMTP_SECURE === 'true',
	auth: process.env.SMTP_USER
		? {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		: undefined
});

async function sendEmail({ to, subject, body, from }) {
	const mailOptions = {
		from: from || process.env.SMTP_FROM,
		to,
		subject,
		html: body
	};

	const info = await transporter.sendMail(mailOptions);
	logger.info('Email sent', { to, messageId: info.messageId });
	return info;
}

module.exports = { sendEmail };
