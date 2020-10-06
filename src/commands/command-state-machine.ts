import { Command } from '../models/commands';
import { IUser } from '../models/user';

interface ICommandStateMachineUserEntry<T> {
  currentState: string;
  currentUser: IUser;
  callbackTimeoutId: number | undefined;
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
  stateMachine: ICommandStateMachine = {};

  getState = <T>(userId: number): ICommandStateMachineUserEntry<T> => {
    if (!this.stateMachine[userId]) {
      this.resetState(userId);
    }
    return this.stateMachine[userId];
  }

  resetState = (userId: number) => {
    this.stateMachine[userId] = <ICommandStateMachineUserEntry<any>>{};
    this.stateMachine[userId].context = {};
    this.stateMachine[userId].currentUser = undefined as any as IUser;
    this.stateMachine[userId].currentCommand = '';
    this.stateMachine[userId].currentState = 'INITIAL';
    this.stateMachine[userId].endKeyboardCommandOnText = undefined;
  }
}

export const stateMachine = new CommandStateMachine();
