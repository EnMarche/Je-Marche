import ApiService from './network/ApiService'
import CacheManager from './store/CacheManager'
import { DataSource } from './DataSource'
import { QuickPoll } from '../core/entities/QuickPoll'
import { RestQuickPollResponse } from './restObjects/RestQuickPollResponse'
import { QuickPollMapper } from './mapper/QuickPollMapper'
import LocalStore from './store/LocalStore'

export interface QuickPollRepository {
  getQuickPolls(dataSource: DataSource): Promise<Array<QuickPoll>>
  sendQuickPollAnswer(answerId: string): Promise<QuickPoll>
  saveAnsweredQuickPoll(quickPollId: string): Promise<void>
  getAnsweredQuickPolls(): Promise<Array<string>>
}
export class QuickPollRepositoryImplementation implements QuickPollRepository {
  private apiService: ApiService
  private cacheManager: CacheManager
  private localStore: LocalStore

  constructor(
    apiService: ApiService,
    cacheManager: CacheManager,
    localStore: LocalStore,
  ) {
    this.apiService = apiService
    this.cacheManager = cacheManager
    this.localStore = localStore
  }

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
}
