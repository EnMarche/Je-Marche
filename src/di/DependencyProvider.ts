import AuthenticationRepository from '../data/AuthenticationRepository'
import ApiService from '../data/network/ApiService'
import {
  PollsRepository,
  PollsRepositoryImplementation,
} from '../data/PollsRepository'
import ProfileRepository from '../data/ProfileRepository'
import {
  QuickPollRepository,
  QuickPollRepositoryImplementation,
} from '../data/QuickPollRepository'
import RegionsRepository from '../data/RegionsRepository'
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
export const profileRepository = ProfileRepository.getInstance()
export const authenticationRepository = AuthenticationRepository.getInstance()
export const regionsRepository = RegionsRepository.getInstance()
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
