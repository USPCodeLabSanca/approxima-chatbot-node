import { Command } from '../models/commands';
import { IUser } from '../models/user';

interface ICommandStateMachineUserEntry<T> {
  currentState: string;
  currentUser: IUser;
  currentCommand: Command | '';
  context: T;
  endKeyboardCommandOnText?: {
    deleteKeyboard?: boolean;
    keyboardId?: number;
  };
}

interface ICommandStateMachine {
  [userId: number]: ICommandStateMachineUserEntry<any>;
}

class CommandStateMachine {
  private stateMachine: ICommandStateMachine = {};

  getState = <T>(userId: number): ICommandStateMachineUserEntry<T> => {
    if (!this.stateMachine[userId]) {
      this.resetState(userId);
    }
    return this.stateMachine[userId];
  }

  resetState = (userId: number) => {
    this.stateMachine[userId] = {
      context: {},
      currentUser: undefined as any as IUser,
      currentCommand: '',
      currentState: 'INITIAL',
      endKeyboardCommandOnText: undefined
    };
  }
}

export const stateMachine = new CommandStateMachine();
