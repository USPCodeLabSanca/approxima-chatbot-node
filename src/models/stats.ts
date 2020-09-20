
export interface IStats {
  /** String representing the day */
  _id: number;
  active_users: IUserDayEntry[];
}

interface IUserDayEntry {
  /** User id */
  _id: string;
  start_command: IStatsEntry[];
  help_command: IStatsEntry[];
  edit_name_command: IStatsEntry[];
  clear_rejects_command: IStatsEntry[];
  edit_interests_command: IStatsEntry[];
  prefs_wrong_action: IStatsEntry[];
  friends_command: IStatsEntry[];
  show_person_command: IStatsEntry[];
  answered_suggestion: IStatsEntry[];
  answered_pending: IStatsEntry[];
}

interface IStatsEntry {
  timestamp: Date;
  data: any;
}
