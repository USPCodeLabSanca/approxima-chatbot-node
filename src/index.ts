import 'source-map-support/register';
// Init dababase
import './database/init';
// Init tasks
import './services/init-tasks';
// init telegram bot and controllers
import './services/init-controllers';
import { isProd } from './helpers';

// Check if any environmental variable is missing

if (!process.env.BOT_TOKEN) {
	throw Error('Please set BOT_TOKEN environmental variable!');
}

if (!process.env.CONNECTION_STRING) {
	throw Error('Please set CONNECTION_STRING environmental variable!');
}

if (!process.env.ADMINS) {
	throw Error('Please set ADMINS environmental variable!');
}

if (isProd) {
	if (!process.env.HEROKU_URL) {
		throw Error('Please set HEROKU_URL environmental variable!');
	}
}
