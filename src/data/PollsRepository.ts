import { Poll } from '../core/entities/Poll'
import { PollResult } from '../core/entities/PollResult'
import ApiService from './network/ApiService'
import { RestPollResultRequestMapper } from './mapper/RestPollResultRequestMapper'
import { DataSource } from './DataSource'
import CacheManager from './store/CacheManager'

export interface PollsRepository {
  getPolls(zipCode?: string, dataSource?: DataSource): Promise<Array<Poll>>
  getPoll(pollId: number): Promise<Poll>
  sendPollAnswers(poll: Poll, result: PollResult): Promise<void>
}

export class PollsRepositoryImplementation implements PollsRepository {
  private apiService: ApiService
  private cacheManager: CacheManager
  private memoryCachedPolls: Array<Poll> = []

  constructor(apiService: ApiService, cacheManager: CacheManager) {
    this.apiService = apiService
    this.cacheManager = cacheManager
  }

  public async getPolls(
    zipCode?: string,
    dataSource: DataSource = 'remote',
  ): Promise<Array<Poll>> {
    const cacheKey = zipCode !== undefined ? 'polls_' + zipCode : 'polls'
    switch (dataSource) {
      case 'cache':
        const cachedPolls = await this.cacheManager.getFromCache(cacheKey)
        this.memoryCachedPolls = cachedPolls
        return cachedPolls
      case 'remote':
        const polls = await this.apiService.getPolls(zipCode)
        await this.cacheManager.setInCache(cacheKey, polls)
        this.memoryCachedPolls = polls
        return polls
    }
  }

  public async getPoll(pollId: number): Promise<Poll> {
    const cachedPoll = this.memoryCachedPolls.find((item) => item.id === pollId)
    if (cachedPoll) {
      return cachedPoll
    }

    // If no cache, fetch again to find matching poll
    const polls = await this.getPolls()
    const poll = polls.find((item_1) => item_1.id === pollId)
    if (poll) {
      return poll
    } else {
      throw new Error(`Poll with id ${pollId} does not exists`)
    }
  }

  public async sendPollAnswers(poll: Poll, result: PollResult): Promise<void> {
    const restResponse = RestPollResultRequestMapper.map(poll, result)
    await this.apiService.sendPollAnswers(restResponse)
  }
}
