import { Db } from 'mongodb';
import { IUser } from '../../models/user';
import { updateUsername } from '../../tasks/update-username';
import { UserRepository } from '../repositories/user';

export class UserController {

	private userRepository: UserRepository;

	constructor(db: Db) {
		this.userRepository = new UserRepository(db);
	}

	getAll = async (allowInactive = false): Promise<IUser[]> => {
		try {
			return await this.userRepository.getAll(allowInactive);
		}
		catch (err) {
			const message = `Error while getting all users: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}

	getAllIds = async (): Promise<number[]> => {
		try {
			return await this.userRepository.getAllIds();
		}
		catch (err) {
			const message = `Error while getting all user ids: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}

	get = async (userId: number, allowInactive: boolean = false): Promise<IUser> => {
		try {
			const data = await this.userRepository.get(userId, allowInactive);
			if (!data) {
				throw new Error('User not found');
			}
			const update = await updateUsername(data, this);
			if (update) {
				if (!update.username && !allowInactive) {
					throw new Error('User deleted it\'s username while using the bot');
				}
				data.username = update.username!;
				data.active = update.active!;
			}
			return data;
		}
		catch (err) {
			const message = `Error while getting user ${userId}: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}

	getByUsername = async (username: string): Promise<IUser | undefined> => {
		try {
			const data = await this.userRepository.getByUsername(username);
			if (!data) {
				throw new Error('User not found');
			}
			return data;
		}
		catch {
			return undefined;
		}
	}

	getAllFromList = async (userIdList: number[]): Promise<IUser[]> => {
		try {
			return await this.userRepository.getAllFromList(userIdList);
		}
		catch (err) {
			const message = `Error while getting all users from list: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}

	create = async (newUser: IUser) => {
		try {
			return await this.userRepository.create(newUser);
		}
		catch (err) {
			const message = `Error while creating a new user: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}

	edit = async (userId: number, user: Partial<IUser>, allowInactive: boolean = false) => {
		try {
			return await this.userRepository.edit(userId, user, allowInactive);
		}
		catch (err) {
			const message = `Error while editing user ${userId}: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}

	removeReferencesOf = async (userId: number) => {
		try {
			return await this.userRepository.removeReferencesOf(userId);
		}
		catch (err) {
			// eslint-disable-next-line
			const message = `Error while removing user ${userId} from all users connections and pokes: ${err}`;
			console.error(message);
			throw new Error(message);
		}
	}
}
