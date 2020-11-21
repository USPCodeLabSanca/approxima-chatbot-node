import 'source-map-support/register';
// Init dababase
import './database/init';
// Init tasks
import './services/init-tasks';
// init telegram bot and controllers
import './services/init-controllers';
import { isProd } from './helpers';

// Check if any environmental variable is missing
const envsToCheck = [
	'BOT_TOKEN',
	'CONNECTION_STRING',
	'ADMINS',
	'ENCRYPTION_KEY',
	'HASH_ITERATIONS',
	'HASH_METHOD',
	'HASH_DIGEST'
];

for (const env of envsToCheck) {
	if (!process.env[env]) {
		throw Error(`Please set ${env} environmental variable!`);
	}
}

if (isProd) {
	const prodEnvsToCheck = ['HEROKU_URL'];

	for (const env of prodEnvsToCheck) {
		if (!process.env[env]) {
			throw Error(`Please set ${env} environmental variable!`);
		}
	}
}
