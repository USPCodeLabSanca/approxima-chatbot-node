import { Db } from 'mongodb';
import { getTodayString, parseDate } from '../../helpers/date';
import { IStats, IStatsEntry, StatsActions } from '../../models/stats';
import { StatsRepository } from '../repositories/stats';

export class StatsController {

	private statsRepository: StatsRepository;

	constructor(db: Db) {
		this.statsRepository = new StatsRepository(db);
	}

	registerAction = async (actionName: StatsActions, userId: number, data?: any) => {
		// Additional data must be an object if not undefined
		if (data && typeof data !== 'object') {
			throw Error('Additional data (3rd argument) in registerAction() must be an object.');
		}
		// Make sure that everything is ok with the Database before proceeding
		const todayDateString = getTodayString();
		let statsDoc = await this.statsRepository.get(todayDateString);
		if (!statsDoc) {
			statsDoc = {
				_id: todayDateString,
				active_users: []
			};
			await this.statsRepository.create(statsDoc);
		}

		const action: IStatsEntry = { timestamp: new Date() };

		if (data) {
			action.data = data;
		}

		let userEntry = statsDoc.active_users.find(entry => entry._id === userId);

		if (!userEntry) {
			userEntry = { _id: userId };
			statsDoc.active_users.push(userEntry);
		}

		if (!userEntry[actionName]) {
			userEntry[actionName] = [];
		}
		userEntry[actionName]!.push(action);

		this.statsRepository.edit(todayDateString, statsDoc);
	}

	getAll = async (): Promise<IStats[]> => {
		return this.statsRepository.getAll();
	}

	get = async (dateString: string | Date): Promise<IStats | null> => {
		if (dateString instanceof Date) {
			dateString = parseDate(dateString);
		}
		return this.statsRepository.get(dateString);
	}

	create = async (newStats: IStats) => {
		return this.statsRepository.create(newStats);
	}

	edit = async (dateString: string | Date, stats: Partial<IStats>) => {
		if (dateString instanceof Date) {
			dateString = parseDate(dateString);
		}
		return this.statsRepository.edit(dateString, stats);
	}
}
