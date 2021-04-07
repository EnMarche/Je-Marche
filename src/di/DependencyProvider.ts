import {
  AuthenticationRepository,
  AuthenticationRepositoryImplementation,
} from '../data/AuthenticationRepository'
import ApiService from '../data/network/ApiService'
import OAuthApiService from '../data/network/OAuthApiService'
import {
  PollsRepository,
  PollsRepositoryImplementation,
} from '../data/PollsRepository'
import {
  ProfileRepository,
  ProfileRepositoryImplementation,
} from '../data/ProfileRepository'
import {
  PushRepository,
  PushRepositoryImplementation,
} from '../data/PushRepository'
import {
  QuickPollRepository,
  QuickPollRepositoryImplementation,
} from '../data/QuickPollRepository'
import {
  RegionsRepository,
  RegionsRepositoryImplementation,
} from '../data/RegionsRepository'
import CacheManager from '../data/store/CacheManager'
import LocalStore from '../data/store/LocalStore'
import ThemeRepository from '../data/ThemeRepository'
import {
  ToolsRepository,
  ToolsRepositoryImplementation,
} from '../data/ToolsRepository'
import { AnonymousLoginInteractorFactory } from './AnonymousLoginInteractorFactory'
import { GetHomeResourcesInteractorFactory } from './GetHomeResourcesInteractorFactory'
import { GetPollsInteractorFactory } from './GetPollsInteractorFactory'
import { GetQuickPollInteractorFactory } from './GetQuickPollInteractorFactory'
import { GetUserProfileInteractorFactory } from './GetUserProfileInteractorFactory'
import { LoginInteractorFactory } from './LoginInteractorFactory'
import { SaveQuickPollAsAnsweredInteractorFactory } from './SaveQuickPollAsAnsweredInteractorFactory'

// Helpers
const apiService = ApiService.getInstance()
const oauthApiService = OAuthApiService.getInstance()
const cacheManager = CacheManager.getInstance()
const localStore = LocalStore.getInstance()

// Repositories
const toolsRepository: ToolsRepository = new ToolsRepositoryImplementation()
const quickPollRepository: QuickPollRepository = new QuickPollRepositoryImplementation(
  apiService,
  cacheManager,
  localStore,
)
export const pollsRepository: PollsRepository = new PollsRepositoryImplementation(
  apiService,
  cacheManager,
)
export const profileRepository: ProfileRepository = new ProfileRepositoryImplementation(
  apiService,
  localStore,
  cacheManager,
)
export const pushRepository: PushRepository = new PushRepositoryImplementation(
  localStore,
)
export const authenticationRepository: AuthenticationRepository = new AuthenticationRepositoryImplementation(
  oauthApiService,
  localStore,
  pushRepository,
)
export const regionsRepository: RegionsRepository = new RegionsRepositoryImplementation(
  oauthApiService,
  authenticationRepository,
  apiService,
  cacheManager,
)
export const themeRepository = ThemeRepository.getInstance()

// Interactor Factories
const getQuickPollInteractorFactory = new GetQuickPollInteractorFactory(
  quickPollRepository,
)
const getPollsInteractorFactory = new GetPollsInteractorFactory(
  pollsRepository,
  profileRepository,
  authenticationRepository,
)
const getHomeResourcesInteractorFactory = new GetHomeResourcesInteractorFactory(
  toolsRepository,
  profileRepository,
  authenticationRepository,
  regionsRepository,
  pushRepository,
  getQuickPollInteractorFactory,
  getPollsInteractorFactory,
)
const saveQuickPollAsAnsweredInteractorFactory = new SaveQuickPollAsAnsweredInteractorFactory(
  quickPollRepository,
)
const getUserProfileInteractorFactory = new GetUserProfileInteractorFactory(
  profileRepository,
  regionsRepository,
  authenticationRepository,
)
const loginInteractorFactory = new LoginInteractorFactory(
  authenticationRepository,
  profileRepository,
  regionsRepository,
  themeRepository,
)
const anonymousLoginInteractorFactory = new AnonymousLoginInteractorFactory(
  authenticationRepository,
  profileRepository,
)

// Public
export const makeGetQuickPollInteractor = () => {
  return getQuickPollInteractorFactory.makeInstance()
}

export const makeGetHomeResourcesInteractor = () => {
  return getHomeResourcesInteractorFactory.makeInstance()
}

export const makeSaveQuickPollAsAnsweredInteractor = () => {
  return saveQuickPollAsAnsweredInteractorFactory.makeInstance()
}

export const makeGetUserProfileInteractor = () => {
  return getUserProfileInteractorFactory.makeInstance()
}

export const makeLoginInteractor = () => {
  return loginInteractorFactory.makeInstance()
}

export const makeAnonymousLoginInteractor = () => {
  return anonymousLoginInteractorFactory.makeInstance()
}
