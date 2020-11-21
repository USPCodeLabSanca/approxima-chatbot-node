import { UserController } from '../database/controllers/user';
import { getDb } from '../database/init';
import { getTimeUnitFromDates } from '../helpers/date';
import { IUser } from '../models/user';

export const encryptAllUsers = async () => {

	const startDate = new Date();
	console.log(`Encrypt dos usernames começou em: ${startDate.toUTCString()}`);
	let updates = 0;
	const userEditPromises: Promise<any>[] = [];

	const db = await getDb();
	const userController = new UserController(db);
	const users = await userController.getAll(true);

	for (const user of users) {
		const result = encriptDbUser(user, userController);

		if (result) {
			userEditPromises.push(result.then(() => updates++));
		}
	}

	await Promise.all(userEditPromises);

	const endDate = new Date();
	console.log(`Encrypt dos users terminou em: ${endDate.toUTCString()}`);
	console.log(`Durou ${getTimeUnitFromDates(startDate, endDate)}`);
	console.log(`Encriptou ${updates} usuarios`);

};


export const encriptDbUser = async (
	user: IUser,
	userController: UserController
): Promise<void> => {

	await userController.edit(user._id, user!, true);
};
