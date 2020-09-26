import { Db } from 'mongodb';
import { IUser } from '../../models/user';
import { UserRepository } from '../repositories/user';

export class UserController {

  private userRepository: UserRepository;

  constructor(db: Db) {
    this.userRepository = new UserRepository(db);
  }

  getAll = async (): Promise<IUser[]> => {
    return this.userRepository.getAll();
  }

  getAllIds = async (): Promise<number[]> => {
    return this.userRepository.getAllIds();
  }

  get = async (userId: number): Promise<IUser> => {
    return this.userRepository.get(userId);
  }

  getAllFromList = async (userIdList: number[]): Promise<IUser[]> => {
    return this.userRepository.getAllFromList(userIdList);
  }

  create = async (newUser: IUser) => {
    return this.userRepository.create(newUser);
  }

  edit = async (userId: number, user: Partial<IUser>) => {
    return this.userRepository.edit(userId, user);
  }
}
