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
import ToolsRepository from '../../data/ToolsRepository'
import AuthenticationRepository from '../../data/AuthenticationRepository'
import { GetPollsInteractor } from './GetPollsInteractor'
import PushRepository from '../../data/PushRepository'
import { DataSource } from '../../data/DataSource'
import { Department } from '../entities/Department'

export interface HomeResources {
  zipCode: string
  region?: Region
  profile?: Profile
  news: Array<News>
  polls: Array<Poll>
  tools: Array<Tool>
  state: AuthenticationState
}

export class GetHomeResourcesInteractor {
  private authenticationRepository = AuthenticationRepository.getInstance()
  private profileRepository = ProfileRepository.getInstance()
  private regionsRepository = RegionsRepository.getInstance()
  private newsRepository = NewsRepository.getInstance()
  private getPollsInteractor = new GetPollsInteractor()
  private toolsRepository = ToolsRepository.getInstance()
  private pushRepository = PushRepository.getInstance()

  public async execute(dataSource: DataSource): Promise<HomeResources> {
    const zipCode = await this.profileRepository.getZipCode()
    const state = await this.authenticationRepository.getAuthenticationState()

    const [
      profileResult,
      departmentResult,
      newsResult,
      pollsResult,
      toolsResult,
    ] = await allSettled([
      state === AuthenticationState.Authenticated
        ? this.profileRepository.getProfile(dataSource)
        : undefined,
      this.regionsRepository.getDepartment(zipCode, dataSource),
      this.newsRepository.getLatestNews(),
      this.getPollsInteractor.execute(dataSource),
      this.toolsRepository.getTools(),
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
      news: newsResult.status === 'fulfilled' ? newsResult.value : [],
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
      state: state,
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
        try {
          return fetch('cache')
        } catch {
          return defaultValue
        }
    }
  }
}
