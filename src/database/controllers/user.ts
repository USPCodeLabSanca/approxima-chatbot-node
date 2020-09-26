import { Db } from 'mongodb';
import { IUser } from '../../models/user';
import { UserRepository } from '../repositories/user';

export class UserController {

  private userRepository: UserRepository;

  constructor(db: Db) {
    this.userRepository = new UserRepository(db);
  }

  getAll = async (): Promise<IUser[]> => {
    try {
      return await this.userRepository.getAll();
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

  get = async (userId: number): Promise<IUser> => {
    try {
      const data = await this.userRepository.get(userId);
      if (!data) {
        throw new Error('User not found');
      }
      return data;
    }
    catch (err) {
      const message = `Error while getting user ${userId}: ${err}`;
      console.error(message);
      throw new Error(message);
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

  edit = async (userId: number, user: Partial<IUser>) => {
    try {
      return await this.userRepository.edit(userId, user);
    }
    catch (err) {
      const message = `Error while editing user ${userId}: ${err}`;
      console.error(message);
      throw new Error(message);
    }
  }
}
