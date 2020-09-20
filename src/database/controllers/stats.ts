import { Db } from 'mongodb';
import { IStats } from '../../models/stats';
import { StatsRepository } from '../repositories/stats';

export class StatsController {

  private statsRepository: StatsRepository;

  constructor(db: Db) {
    this.statsRepository = new StatsRepository(db);
  }

  getAll = async (): Promise<IStats[]> => {
    return this.statsRepository.getAll();
  }

  get = async (statsId: number): Promise<IStats> => {
    return this.statsRepository.get(statsId);
  }

  create = async (newStats: IStats) => {
    return this.statsRepository.create(newStats);
  }

  edit = async (statsId: number, stats: Partial<IStats>) => {
    return this.statsRepository.edit(statsId, stats);
  }
}
