import { UserController } from '../database/controllers/user';
import { getDb } from '../database/init';
import { getTimeUnitFromDates } from '../helpers/date';
import { IUser } from '../models/user';
import { getTelegramBot } from '../services/telegram-bot';

export const updateAllUsernames = async () => {

  const startDate = new Date();
  console.log(`Update dos usernames começou em: ${startDate.toUTCString()}`);
  let updates = 0;
  const userEditPromises: Promise<any>[] = [];

  const db = await getDb();
  const userController = new UserController(db);
  const users = await userController.getAll(true);

  for (const user of users) {
    const result = updateUsername(user, userController);

    if (result) {
      userEditPromises.push(result.then(() => updates++));
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


export const updateUsername = async (
  user: IUser,
  userController: UserController
): Promise<Partial<IUser> | undefined> => {
  const bot = getTelegramBot();

  const { user: userInfo } = await bot.getChatMember(user._id, String(user._id));

  const telegramUsername = userInfo.username ? '@' + userInfo.username : undefined;

  if (telegramUsername != user.username) {
    const userUpdate: Partial<IUser> = {
      username: telegramUsername,
      active: user.active
    };
    if (!telegramUsername) {
      userUpdate.active = false;
    }

    return userController.edit(user._id, userUpdate, true).then(() => userUpdate);
  }

  return undefined;
};
