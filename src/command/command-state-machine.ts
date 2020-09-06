import { Command } from '../models/command';

interface ICommandStateMachineUserEntry<T> {
  currentState: string;
  currentCommand: Command | '';
  context: T;
}

interface ICommandStateMachine {
  [userId: number]: ICommandStateMachineUserEntry<any>;
}

class CommandStateMachine {
  private stateMachine: ICommandStateMachine = {};

  getState = <T>(userId: number): ICommandStateMachineUserEntry<T> => {
    if (!this.stateMachine[userId]) {
      this.stateMachine[userId] = {
        context: {},
        currentCommand: '',
        currentState: 'INITIAL'
      };
    }
    return this.stateMachine[userId];
  }

  resetState = (userId: number) => {
    this.stateMachine[userId] = {
      context: {},
      currentCommand: '',
      currentState: 'INITIAL'
    };
  }


}

export const stateMachine = new CommandStateMachine();
