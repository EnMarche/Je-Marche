import {
  GetHomeResourcesInteractor,
  GetHomeResourcesInteractorImplementation,
} from '../core/interactor/GetHomeResourcesInteractor'
import { AuthenticationRepository } from '../data/AuthenticationRepository'
import { NewsRepository } from '../data/NewsRepository'
import { ProfileRepository } from '../data/ProfileRepository'
import { PushRepository } from '../data/PushRepository'
import { RegionsRepository } from '../data/RegionsRepository'
import { ToolsRepository } from '../data/ToolsRepository'
import { GetPollsInteractorFactory } from './GetPollsInteractorFactory'
import { GetQuickPollInteractorFactory } from './GetQuickPollInteractorFactory'

export class GetHomeResourcesInteractorFactory {
  private toolsRepository: ToolsRepository
  private profileRepository: ProfileRepository
  private authenticationRepository: AuthenticationRepository
  private regionsRepository: RegionsRepository
  private pushRepository: PushRepository
  private newsRepository: NewsRepository
  private getQuickPollInteractorFactory: GetQuickPollInteractorFactory
  private getPollsInteractorFactory: GetPollsInteractorFactory

  constructor(
    toolsRepository: ToolsRepository,
    profileRepository: ProfileRepository,
    authenticationRepository: AuthenticationRepository,
    regionsRepository: RegionsRepository,
    pushRepository: PushRepository,
    newsRepository: NewsRepository,
    getQuickPollInteractorFactory: GetQuickPollInteractorFactory,
    getPollsInteractorFactory: GetPollsInteractorFactory,
  ) {
    this.toolsRepository = toolsRepository
    this.profileRepository = profileRepository
    this.authenticationRepository = authenticationRepository
    this.regionsRepository = regionsRepository
    this.pushRepository = pushRepository
    this.newsRepository = newsRepository
    this.getQuickPollInteractorFactory = getQuickPollInteractorFactory
    this.getPollsInteractorFactory = getPollsInteractorFactory
  }

  makeInstance(): GetHomeResourcesInteractor {
    return new GetHomeResourcesInteractorImplementation(
      this.authenticationRepository,
      this.profileRepository,
      this.regionsRepository,
      this.newsRepository,
      this.getPollsInteractorFactory.makeInstance(),
      this.toolsRepository,
      this.pushRepository,
      this.getQuickPollInteractorFactory.makeInstance(),
    )
  }
}
