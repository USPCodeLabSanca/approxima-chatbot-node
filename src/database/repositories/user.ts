import { Collection, Db } from 'mongodb';
import { isProd } from '../../helpers';
import { IUser } from '../../models/user';

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
		return this.usersCollection.find({ active: true }).toArray();
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
			return this.usersCollection.findOne({ _id: userId });
		}
		else {
			return this.usersCollection.findOne({ _id: userId, active: true });
		}
	}

	getByUsername = async (username: string): Promise<IUser | null> => {
		return this.usersCollection.findOne({ username, active: true });
	}

	getAllFromList = async (userIdList: number[]): Promise<IUser[]> => {
		const query = { _id: { $in: userIdList }, active: true };
		return this.usersCollection.find(query).toArray();
	}

	create = async (newUser: IUser) => {
		const userExists = await this.get(newUser._id);
		if (userExists) {
			throw new Error('User already exists.');
		}

		return this.usersCollection.insertOne(newUser);
	}

	edit = async (userId: number, user: Partial<IUser>, allowInactive: boolean = false) => {
		const userInDb = await this.get(userId, allowInactive);
		if (!userInDb) {
			throw new Error('User does not exist or is not active anymore.');
		}

		user['updated_at'] = Date.now();

		return this.usersCollection.updateOne({ _id: userId }, { $set: user });
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
