import { Collection, Db } from 'mongodb';
import { isProd } from '../../helpers';
import { IStats } from '../../models/stats';

export class StatsRepository {

  private statsCollection: Collection<IStats>;

  constructor(db: Db) {
    const collectionName = isProd ? 'production-stats' : 'test-stats';
    this.statsCollection = db.collection(collectionName);
  }

  getAll = async (): Promise<IStats[]> => {
    return this.statsCollection.find().toArray();
  }

  get = async (statsId: number): Promise<IStats> => {
    const stats = await this.statsCollection.findOne({ _id: statsId });
    if (!stats) {
      throw Error('Stats should exsits');
    }
    return stats;
  }

  create = async (newStats: IStats) => {
    const stats = await this.get(newStats._id);
    if (stats) {
      console.error('Stats already exists');
      return;
    }
    return this.statsCollection.insertOne(newStats);
  }

  edit = async (statsId: number, stats: Partial<IStats>) => {
    const statsInDb = await this.get(statsId);
    if (!statsInDb) {
      console.error('Stats does not exist');
      return;
    }
    return this.statsCollection.updateOne({ _id: statsId }, { $set: stats });
  }
}
