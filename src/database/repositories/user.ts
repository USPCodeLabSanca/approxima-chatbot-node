import { Collection, Db } from 'mongodb';
import { isProd } from '../../helpers';
import { IUser } from '../../models/user';
import { decrypt, encrypt } from '../../services/crypto';


const encryptUser = (user: Partial<IUser>) => {
	if (user.name) {
		user.name = encrypt(user.name);
	}
	if (user.bio) {
		user.bio = encrypt(user.bio);
	}
	if (user.username) {
		user.username = encrypt(user.username);
	}
	return user;
};

const decryptUser = (user: IUser | null) => {
	if (!user) return user;
	return {
		...user,
		name: decrypt(user.name),
		bio: decrypt(user.bio),
		username: decrypt(user.username)
	};
};

export class UserRepository {

	private usersCollection: Collection<IUser>;

	constructor(db: Db) {
		const collectionName = isProd ? 'production-users' : 'users';
		this.usersCollection = db.collection(collectionName);
	}

	getAll = async (allowInactive: boolean = false): Promise<IUser[]> => {
		if (allowInactive) {
			return this.usersCollection.find({}).toArray();
		}
		return this.usersCollection.find({ active: true }).toArray().then(users =>
			users.map(user => decryptUser(user)!)
		);
	}

	getAllIds = async (): Promise<number[]> => {
		const allUserIds: Partial<IUser>[] = await this.usersCollection.find(
			{
				active: true
			},
			{
				projection: {
					_id: 1,
				}
			}
		).toArray();
		console.log(allUserIds);

		// allUsersIds is in the format:
		// [ { _id: xxxxx }, { _id: yyyyy }, { _id: zzzzz } ]
		// So it's necessary to extract only the _id property from it.
		return allUserIds.map(user => user._id!);
	}

	get = async (userId: number, allowInactive: boolean = false): Promise<IUser | null> => {
		if (allowInactive) {
			return this.usersCollection.findOne({ _id: userId }).then(decryptUser);
		}
		else {
			return this.usersCollection.findOne({ _id: userId, active: true }).then(decryptUser);
		}
	}

	getByUsername = async (username: string): Promise<IUser | null> => {
		return this.usersCollection.findOne({ username, active: true }).then(decryptUser);
	}

	getAllFromList = async (userIdList: number[]): Promise<IUser[]> => {
		const query = { _id: { $in: userIdList }, active: true };
		return this.usersCollection.find(query).toArray().then(users =>
			users.map(user => decryptUser(user)!)
		);
	}

	create = async (newUser: IUser) => {
		const userExists = await this.get(newUser._id);
		if (userExists) {
			throw new Error('User already exists.');
		}

		return this.usersCollection.insertOne(encryptUser(newUser) as IUser);
	}

	edit = async (userId: number, user: Partial<IUser>, allowInactive: boolean = false) => {
		const userInDb = await this.get(userId, allowInactive);
		if (!userInDb) {
			throw new Error('User does not exist or is not active anymore.');
		}

		user.updated_at = new Date();

		return this.usersCollection.updateOne({ _id: userId }, { $set: encryptUser(user) });
	}

	removeReferencesOf = async (userId: number) => {
		this.usersCollection.updateMany(
			{}, // update all documents
			{
				$pull: { // remove my id from all sensible arrays if I'm there
					pending: userId,
					connections: userId,
					pokes: userId,
				}
			},
		);
	}
}
