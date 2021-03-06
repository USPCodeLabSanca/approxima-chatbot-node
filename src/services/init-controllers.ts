import { onCallbackQuery } from '../controllers/on-callback-query';
import { onText } from '../controllers/on-text';
import { getDb } from '../database/init';
import { ApproximaClient } from './client';
import { getTelegramBot } from './telegram-bot';

// Self-Executing Anonymous Function because we have to `await` for the databse to be ready
(async () => {

	const db = await getDb();
	const telegramBot = getTelegramBot();

	telegramBot.on('text', async (msg) => {
		if (!msg.from) {
			console.error('"from" in msg is undefined', msg);
			return;
		}

		const client = new ApproximaClient(db, { message: msg });
		await onText(client, msg);
	});

	telegramBot.on('callback_query', async (msg) => {

		if (!msg.message) {
			console.error('No message in callback query');
			return;
		}

		const client = new ApproximaClient(db, { callbackMessage: msg });
		await onCallbackQuery(client, msg);
	});

	console.log('Approxima bot started running');
})();
