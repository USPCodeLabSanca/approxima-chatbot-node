
export interface IStats {
  /** String representing the day */
  _id: string;
  active_users: IUserDayEntry[];
}

const stateActions = [
  'start_command',
  'help_command',
  'edit_command',
  'clear_rejects_command',
  'prefs_command',
  'prefs_wrong_action',
  'friends_command',
  'show_person_command',
  'answered_suggestion',
  'answered_pending',
  'random_person_command',
  'pending_command',
  'notify_command',
  'admin_notified'
] as const;

export type StatsActions = typeof stateActions[number];

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
