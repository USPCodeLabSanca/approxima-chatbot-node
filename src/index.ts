// Init dababase
import './database/init';
// init telegram bot and controllers
import './services/init-controllers';
import { isProd } from './helpers';

// Check if any environmental variable is missing
if (
  !process.env.BOT_TOKEN ||
  !process.env.CONNECTION_STRING ||
  (isProd && !process.env.HEROKU_URL)
) {
  throw Error('Please set environment variables!');
}
