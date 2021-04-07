import { AuthenticationState } from '../entities/AuthenticationState'
import { News } from '../entities/News'
import { Poll } from '../entities/Poll'
import { Region } from '../entities/Region'
import { Tool } from '../entities/Tool'
import { Profile } from '../entities/Profile'
import allSettled from 'promise.allsettled'
import ProfileRepository from '../../data/ProfileRepository'
import NewsRepository from '../../data/NewsRepository'
import RegionsRepository from '../../data/RegionsRepository'
import {
  ToolsRepository,
  ToolsRepositoryImplementation,
} from '../../data/ToolsRepository'
import AuthenticationRepository from '../../data/AuthenticationRepository'
import { GetPollsInteractor } from './GetPollsInteractor'
import PushRepository from '../../data/PushRepository'
import { DataSource } from '../../data/DataSource'
import {
  GetQuickPollInteractor,
  useGetQuickPollInteractor,
} from './GetQuickPollInteractor'
import { StatefulQuickPoll } from '../entities/StatefulQuickPoll'
import { useDI } from '../../di/DIContext'

export interface HomeResources {
  zipCode: string
  region?: Region
  profile?: Profile
  news: Array<News>
  polls: Array<Poll>
  tools: Array<Tool>
  quickPoll?: StatefulQuickPoll
}

export interface GetHomeResourcesInteractor {
  execute(dataSource: DataSource): Promise<HomeResources>
}

export const useGetHomeResourcesInteractor: () => GetHomeResourcesInteractor = () => {
  const { toolsRepository } = useDI()
  const getQuickPollInteractor = useGetQuickPollInteractor()
  return new GetHomeResourcesInteractorImplementation(
    AuthenticationRepository.getInstance(),
    ProfileRepository.getInstance(),
    RegionsRepository.getInstance(),
    NewsRepository.getInstance(),
    new GetPollsInteractor(),
    toolsRepository,
    PushRepository.getInstance(),
    getQuickPollInteractor,
  )
}

export class GetHomeResourcesInteractorImplementation
  implements GetHomeResourcesInteractor {
  private authenticationRepository: AuthenticationRepository
  private profileRepository: ProfileRepository
  private regionsRepository: RegionsRepository
  private newsRepository: NewsRepository
  private getPollsInteractor: GetPollsInteractor
  private toolsRepository: ToolsRepository
  private pushRepository: PushRepository
  private getQuickPollInteractor: GetQuickPollInteractor

  constructor(
    authenticationRepository: AuthenticationRepository = AuthenticationRepository.getInstance(),
    profileRepository: ProfileRepository = ProfileRepository.getInstance(),
    regionsRepository: RegionsRepository = RegionsRepository.getInstance(),
    newsRepository: NewsRepository = NewsRepository.getInstance(),
    getPollsInteractor: GetPollsInteractor = new GetPollsInteractor(),
    toolsRepository: ToolsRepository = new ToolsRepositoryImplementation(),
    pushRepository: PushRepository = PushRepository.getInstance(),
    getQuickPollInteractor: GetQuickPollInteractor = new GetQuickPollInteractor(),
  ) {
    this.authenticationRepository = authenticationRepository
    this.profileRepository = profileRepository
    this.regionsRepository = regionsRepository
    this.newsRepository = newsRepository
    this.getPollsInteractor = getPollsInteractor
    this.toolsRepository = toolsRepository
    this.pushRepository = pushRepository
    this.getQuickPollInteractor = getQuickPollInteractor
  }

  public async execute(dataSource: DataSource): Promise<HomeResources> {
    const zipCode = await this.profileRepository.getZipCode()
    const state = await this.authenticationRepository.getAuthenticationState()

    const [
      profileResult,
      departmentResult,
      newsResult,
      pollsResult,
      toolsResult,
      quickPollsResult,
    ] = await allSettled([
      state === AuthenticationState.Authenticated
        ? this.profileRepository.getProfile(dataSource)
        : undefined,
      this.regionsRepository.getDepartment(zipCode, dataSource),
      this.newsRepository.getLatestNews(zipCode, dataSource),
      this.getPollsInteractor.execute(dataSource),
      this.toolsRepository.getTools(),
      this.getQuickPollInteractor.execute(dataSource),
    ])

    const department =
      departmentResult.status === 'fulfilled'
        ? departmentResult.value
        : await this.getDefault(
            dataSource,
            (departmentDataSource) =>
              this.regionsRepository.getDepartment(
                zipCode,
                departmentDataSource,
              ),
            undefined,
          )

    if (department !== undefined) {
      try {
        await this.pushRepository.subscribeToDepartment(department)
        await this.pushRepository.subscribeToRegion(department.region)
      } catch (error) {
        console.log(error)
        // no-op
      }
    }

    return {
      zipCode: zipCode,
      region: department?.region,
      profile:
        profileResult?.status === 'fulfilled'
          ? profileResult.value
          : await this.getDefault(
              dataSource,
              (profileDataSource) =>
                this.profileRepository.getProfile(profileDataSource),
              undefined,
            ),
      news:
        newsResult.status === 'fulfilled'
          ? newsResult.value
          : await this.getDefault(
              dataSource,
              (newsDataSource) =>
                this.newsRepository.getLatestNews(zipCode, newsDataSource),
              [],
            ),
      polls:
        pollsResult.status === 'fulfilled'
          ? pollsResult.value
          : await this.getDefault(
              dataSource,
              (pollsDataSource) =>
                this.getPollsInteractor.execute(pollsDataSource),
              [],
            ),
      tools: toolsResult.status === 'fulfilled' ? toolsResult.value : [],
      quickPoll:
        quickPollsResult.status === 'fulfilled'
          ? quickPollsResult.value
          : undefined,
    }
  }

  private async getDefault<T>(
    dataSource: DataSource,
    fetch: (dataSource: DataSource) => Promise<T>,
    defaultValue: T,
  ): Promise<T> {
    switch (dataSource) {
      case 'cache':
        return defaultValue
      case 'remote':
        return fetch('cache').catch(() => defaultValue)
    }
  }
}
