
export interface IStats {
  /** String representing the day */
  _id: string;
  active_users: IUserDayEntry[];
}

export type StatsActions = Exclude<keyof IUserDayEntry, '_id'>;

export interface IUserDayEntry {
  /** User id */
  _id: number;
  start_command?: IStatsEntry[];
  help_command?: IStatsEntry[];
  edit_name_command?: IStatsEntry[];
  clear_rejects_command?: IStatsEntry[];
  edit_interests_command?: IStatsEntry[];
  prefs_wrong_action?: IStatsEntry[];
  friends_command?: IStatsEntry[];
  show_person_command?: IStatsEntry[];
  answered_suggestion?: IStatsEntry[];
  answered_pending?: IStatsEntry[];
}

export interface IStatsEntry {
  timestamp: Date;
  data?: any;
}
