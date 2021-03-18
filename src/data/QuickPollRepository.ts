import ApiService from './network/ApiService'
import CacheManager from './store/CacheManager'
import { DataSource } from './DataSource'
import { QuickPoll } from '../core/entities/QuickPoll'
import { RestQuickPollResponse } from './restObjects/RestQuickPollResponse'
import { QuickPollMapper } from './mapper/QuickPollMapper'
import LocalStore from './store/LocalStore'

class QuickPollRepository {
  private static instance: QuickPollRepository
  private apiService = ApiService.getInstance()
  private cacheManager = CacheManager.getInstance()
  private localStore = LocalStore.getInstance()
  private constructor() {}

  public async getQuickPolls(
    dataSource: DataSource = 'remote',
  ): Promise<Array<QuickPoll>> {
    const cacheKey = 'quick_polls'
    let restResponse: RestQuickPollResponse
    switch (dataSource) {
      case 'cache':
        restResponse = await this.cacheManager.getFromCache(cacheKey)
        break
      case 'remote':
        restResponse = await this.apiService.getQuickPolls()
        await this.cacheManager.setInCache(cacheKey, restResponse)
        break
    }
    return restResponse.items.map(QuickPollMapper.map)
  }

  public async sendQuickPollAnswer(answerId: string): Promise<QuickPoll> {
    let restPoll = await this.apiService.sendQuickPollAnswer(answerId)
    return QuickPollMapper.map(restPoll)
  }

  public saveAnsweredQuickPoll(quickPollId: string): Promise<void> {
    return this.localStore.storeAnsweredQuickPoll(quickPollId)
  }

  public getAnsweredQuickPolls(): Promise<Array<string>> {
    return this.localStore.getAnsweredQuickPolls()
  }

  public static getInstance(): QuickPollRepository {
    if (!QuickPollRepository.instance) {
      QuickPollRepository.instance = new QuickPollRepository()
    }
    return QuickPollRepository.instance
  }
}

export default QuickPollRepository