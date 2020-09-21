
export interface IStats {
  /** String representing the day */
  _id: string;
  active_users: IUserDayEntry[];
}

export type StatsActions = typeof stateActions[number];

const stateActions = [
  'start_command',
  'help_command',
  'edit_name_command',
  'clear_rejects_command',
  'edit_interests_command',
  'prefs_wrong_action',
  'friends_command',
  'show_person_command',
  'answered_suggestion',
  'answered_pending',
  'edit_desc_command',
  'random_person_command',
  'pending_command'
] as const;

export interface IUserDayEntry extends UserActionEntry {
  /** User id */
  _id: number;
}

type UserActionEntry = {
  [action in StatsActions]?: IStatsEntry[];
}

export interface IStatsEntry {
  timestamp: Date;
  data?: any;
}
