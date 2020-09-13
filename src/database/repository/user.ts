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

  get = async (userId: number): Promise<IUser> => {
    const user = await this.usersCollection.findOne({ _id: userId });
    if (!user) {
      // TODO: fazer com que essa funcao seja chamada somente se o usuario existe
      // TODO: fazer o setup inicial do usuario
      throw Error('User should exsits');
    }
    return user;
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
