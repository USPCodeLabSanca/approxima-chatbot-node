import { Collection, Db } from 'mongodb';
import { isProd } from '../../helpers';
import { IUser } from '../../models/user';

export class UserRepository {

  private usersCollection: Collection<IUser>;

  constructor(db: Db) {
    const collectionName = isProd ? 'production-users' : 'users';
    this.usersCollection = db.collection(collectionName);
  }

  getAll = async (): Promise<IUser[]> => {
    return this.usersCollection.find().toArray();
  }

  getAllIds = async (): Promise<number[]> => {
    return this.usersCollection.find().project({}).toArray() as any;
  }

  get = async (userId: number): Promise<IUser | null> => {
    return this.usersCollection.findOne({ _id: userId });
  }

  getAllFromList = async (userIdList: number[]): Promise<IUser[]> => {
    const query = { '_id': { '$in': userIdList } };
    return this.usersCollection.find(query).toArray();
  }

  create = async (newUser: IUser) => {
    const userExists = await this.get(newUser._id);
    if (userExists) {
      throw new Error('User already exists.');
    }

    return this.usersCollection.insertOne(newUser);
  }

  edit = async (userId: number, user: Partial<IUser>) => {
    const userInDb = await this.get(userId);
    if (!userInDb) {
      throw new Error('User does not exist');
    }

    return this.usersCollection.updateOne({ _id: userId }, { $set: user });
  }
}
