import { CommandStateResolver } from '../../models/commands';

export const deleteCommand: CommandStateResolver<'delete'> = {
  INITIAL: async (_client, _arg) => {
    console.log('TODO');
    return 'END' as const;
  },
  CHOOSE_DELETE: (_client, _arg, _originalArg) => {
    return 'END';
  }
};
