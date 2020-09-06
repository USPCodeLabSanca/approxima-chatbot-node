import './services/db';
import './services/telegram-bot';
import { isProd } from './helpers';

if (
  !process.env.BOT_TOKEN ||
  !process.env.CONNECTION_STRING ||
  (isProd && !process.env.HEROKU_URL)
) {
  throw Error('Please set environment variables!');
}
