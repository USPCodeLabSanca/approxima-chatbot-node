import { IUser } from '../models/user';
import { Collection } from 'mongodb';
import { getDb } from '../services/db';
import { isProd } from '../helpers';


export class UserController {

  private userCollection: Collection<IUser>;

  constructor() {
    const collectionName = isProd ? 'production-users' : 'users';
    this.userCollection = getDb().collection(collectionName);
  }

  getAll = async (): Promise<IUser[]> => {
    return this.userCollection.find().toArray();
  }

  get = async (userId: number): Promise<IUser | undefined | null> => {
    return this.userCollection.findOne({ _id: userId });
  }

  create = async (newUser: IUser) => {
    const user = await this.get(newUser._id);
    if (user) {
      console.error('User already exists');
      return;
    }
    return this.userCollection.insertOne(newUser);
  }

  edit = async (userId: number, user: Partial<IUser>) => {
    const userInDb = await this.get(userId);
    if (!userInDb) {
      console.error('User does not exist');
      return;
    }
    return this.userCollection.updateOne({ _id: userId }, { $set: user });
  }
}
