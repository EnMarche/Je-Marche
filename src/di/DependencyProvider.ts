import { AnonymousLoginInteractor } from '../core/interactor/AnonymousLoginInteractor'
import { GetHomeResourcesInteractor } from '../core/interactor/GetHomeResourcesInteractor'
import { GetQuickPollInteractor } from '../core/interactor/GetQuickPollInteractor'
import { GetUserProfileInteractor } from '../core/interactor/GetUserProfileInteractor'
import { LoginInteractor } from '../core/interactor/LoginInteractor'
import { SaveQuickPollAsAnsweredInteractor } from '../core/interactor/SaveQuickPollAsAnsweredInteractor'
import AuthenticationRepository from '../data/AuthenticationRepository'
import ApiService from '../data/network/ApiService'
import PollsRepository from '../data/PollsRepository'
import ProfileRepository from '../data/ProfileRepository'
import { QuickPollRepositoryImplementation } from '../data/QuickPollRepository'
import RegionsRepository from '../data/RegionsRepository'
import CacheManager from '../data/store/CacheManager'
import LocalStore from '../data/store/LocalStore'
import ThemeRepository from '../data/ThemeRepository'
import { ToolsRepositoryImplementation } from '../data/ToolsRepository'
import { AnonymousLoginInteractorFactory } from './AnonymousLoginInteractorFactory'
import { GetHomeResourcesInteractorFactory } from './GetHomeResourcesInteractorFactory'
import { GetPollsInteractorFactory } from './GetPollsInteractorFactory'
import { GetQuickPollInteractorFactory } from './GetQuickPollInteractorFactory'
import { GetUserProfileInteractorFactory } from './GetUserProfileInteractorFactory'
import { LoginInteractorFactory } from './LoginInteractorFactory'
import { SaveQuickPollAsAnsweredInteractorFactory } from './SaveQuickPollAsAnsweredInteractorFactory'

export class DependencyProvider {
  private static instance: DependencyProvider
  private getQuickPollInteractorFactory: GetQuickPollInteractorFactory
  private getHomeResourcesInteractorFactory: GetHomeResourcesInteractorFactory
  private saveQuickPollAsAnsweredInteractorFactory: SaveQuickPollAsAnsweredInteractorFactory
  private getPollsInteractorFactory: GetPollsInteractorFactory
  private getUserProfileInteractorFactory: GetUserProfileInteractorFactory
  private loginInteractorFactory: LoginInteractorFactory
  private anonymousLoginInteractorFactory: AnonymousLoginInteractorFactory

  private constructor() {
    const toolsRepository = new ToolsRepositoryImplementation()
    const quickPollRepository = new QuickPollRepositoryImplementation(
      ApiService.getInstance(),
      CacheManager.getInstance(),
      LocalStore.getInstance(),
    )
    const pollsRepository = PollsRepository.getInstance()
    const profileRepository = ProfileRepository.getInstance()
    const authenticationRepository = AuthenticationRepository.getInstance()
    const regionsRepository = RegionsRepository.getInstance()
    const themeRepository = ThemeRepository.getInstance()

    this.getQuickPollInteractorFactory = new GetQuickPollInteractorFactory(
      quickPollRepository,
    )
    this.getPollsInteractorFactory = new GetPollsInteractorFactory(
      pollsRepository,
      profileRepository,
      authenticationRepository,
    )
    this.getHomeResourcesInteractorFactory = new GetHomeResourcesInteractorFactory(
      toolsRepository,
      this.getQuickPollInteractorFactory,
      this.getPollsInteractorFactory,
    )
    this.saveQuickPollAsAnsweredInteractorFactory = new SaveQuickPollAsAnsweredInteractorFactory(
      quickPollRepository,
    )
    this.getUserProfileInteractorFactory = new GetUserProfileInteractorFactory(
      profileRepository,
      regionsRepository,
      authenticationRepository,
    )
    this.loginInteractorFactory = new LoginInteractorFactory(
      authenticationRepository,
      profileRepository,
      regionsRepository,
      themeRepository,
    )
    this.anonymousLoginInteractorFactory = new AnonymousLoginInteractorFactory(
      authenticationRepository,
      profileRepository,
    )
  }

  public makeGetQuickPollInteractor(): GetQuickPollInteractor {
    return this.getQuickPollInteractorFactory.makeInstance()
  }

  public makeGetHomeResourcesInteractor(): GetHomeResourcesInteractor {
    return this.getHomeResourcesInteractorFactory.makeInstance()
  }

  public makeSaveQuickPollAsAnsweredInteractor(): SaveQuickPollAsAnsweredInteractor {
    return this.saveQuickPollAsAnsweredInteractorFactory.makeInstance()
  }

  public makeGetUserProfileInteractor(): GetUserProfileInteractor {
    return this.getUserProfileInteractorFactory.makeInstance()
  }

  public makeLoginInteractor(): LoginInteractor {
    return this.loginInteractorFactory.makeInstance()
  }

  public makeAnonymousLoginInteractor(): AnonymousLoginInteractor {
    return this.anonymousLoginInteractorFactory.makeInstance()
  }

  public static sharedInstance(): DependencyProvider {
    if (!DependencyProvider.instance) {
      DependencyProvider.instance = new DependencyProvider()
    }
    return DependencyProvider.instance
  }
}
