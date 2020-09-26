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

  get = async (userId: number): Promise<IUser> => {
    const user = await this.usersCollection.findOne({ _id: userId });
    if (!user) {
      throw Error('User should exist');
    }
    return user;
  }

  create = async (newUser: IUser) => {
    try {
      const user = await this.get(newUser._id);
      if (user) {
        console.error('User already exists');
        return;
      }
    }
    catch {
      console.log('This user does not exist... we\'re fine.');
    }

    return this.usersCollection.insertOne(newUser);
  }

  edit = async (userId: number, user: Partial<IUser>) => {
    const userInDb = await this.get(userId);
    if (!userInDb) {
      console.error('User does not exist');
      return;
    }
    return this.usersCollection.updateOne({ _id: userId }, { $set: user });
  }

  getAllFromList = async (userIdList: number[]): Promise<IUser[]> => {
    const query = { '_id': { '$in': userIdList } };
    return this.usersCollection.find(query).toArray();
  }
}
