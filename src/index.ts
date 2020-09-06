import './services/telegram-bot';
import './services/db';
import { isProd } from './helpers';

if (
  !process.env.BOT_TOKEN ||
  !process.env.CONNECTION_STRING ||
  !process.env.DATABASE_NAME ||
  (isProd && !process.env.HEROKU_URL)
) {
  throw Error('Please set environment variables!');
}
