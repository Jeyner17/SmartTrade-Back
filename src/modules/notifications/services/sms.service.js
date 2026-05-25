const logger = require('../../../utils/logger');
let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
	const twilio = require('twilio');
	client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendSms({ to, body, from }) {
	if (!client) throw new Error('Twilio no configurado');
	const msg = await client.messages.create({
		body,
		from: from || process.env.TWILIO_FROM,
		to
	});
	logger.info('SMS sent', { to, sid: msg.sid });
	return msg;
}

module.exports = { sendSms };
