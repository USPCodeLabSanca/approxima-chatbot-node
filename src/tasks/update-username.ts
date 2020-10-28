import { UserController } from '../database/controllers/user';
import { getDb } from '../database/init';
import { getTimeUnitFromDates } from '../helpers/date';
import { IUser } from '../models/user';
import { getTelegramBot } from '../services/telegram-bot';

export const updateUsernames = async () => {

  const startDate = new Date();
  console.log(`Update dos usernames começou em: ${startDate.toUTCString()}`);
  let updates = 0;
  const userEditPromises: Promise<any>[] = [];

  const db = await getDb();
  const bot = getTelegramBot();
  const userController = new UserController(db);
  const users = await userController.getAll(true);

  for (const user of users) {
    const { user: userInfo } = await bot.getChatMember(user._id, String(user._id));

    const telegramUsername = userInfo.username ? '@' + userInfo.username : undefined;

    if (telegramUsername != user.username) {
      const userUpdate: Partial<IUser> = {
        username: telegramUsername
      };
      if (!userInfo.username) {
        userUpdate.active = false;
      }
      userEditPromises.push(
        userController.edit(user._id, userUpdate, true)
      );
      updates++;
    }
  }

  await Promise.all(userEditPromises);

  const endDate = new Date();
  console.log(`Update dos usernames terminou em: ${endDate.toUTCString()}`);
  console.log(`Durou ${getTimeUnitFromDates(startDate, endDate)}`);

  if (updates == 0) {
    console.log(`Nenhum usuario foi atualizado`);
  }
  else if (updates == 1) {
    console.log(`Atualizou ${updates} usuario`);
  }
  else {
    console.log(`Atualizou ${updates} usuarios`);
  }

};
