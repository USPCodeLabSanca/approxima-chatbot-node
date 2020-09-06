import { IUser } from '../models/user';
import { Collection, Db } from 'mongodb';
import { isProd } from '../helpers';


export class UserController {

  private usersCollection: Collection<IUser>;

  constructor(db: Db) {
    const collectionName = isProd ? 'production-users' : 'users';
    this.usersCollection = db.collection(collectionName);
  }

  getAll = async (): Promise<IUser[]> => {
    return this.usersCollection.find().toArray();
  }

  get = async (userId: number): Promise<IUser | undefined | null> => {
    return this.usersCollection.findOne({ _id: userId });
  }

  create = async (newUser: IUser) => {
    const user = await this.get(newUser._id);
    if (user) {
      console.error('User already exists');
      return;
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
}
