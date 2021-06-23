import { AuthenticationState } from '../core/entities/AuthenticationState'
import { RefreshTokenPermanentlyInvalidatedError } from '../core/errors'
import OAuthApiService from './network/OAuthApiService'
import { RestLoginResponse } from './restObjects/RestLoginResponse'
import { Credentials } from './store/Credentials'
import LocalStore from './store/LocalStore'
import iid from '@react-native-firebase/iid'
import PushRepository from './PushRepository'
import CacheManager from './store/CacheManager'

class AuthenticationRepository {
  private static instance: AuthenticationRepository
  private apiService = OAuthApiService.getInstance()
  private localStore = LocalStore.getInstance()
  private pushRepository = PushRepository.getInstance()

  private constructor() {}

  public stateListener?: (state: AuthenticationState) => void

  public getAuthenticationState(): Promise<AuthenticationState> {
    return this.localStore.getCredentials().then((credentials) => {
      if (credentials == null) return AuthenticationState.Unauthenticated

      // anonymous users don't retrieve a refresh token during authentication
      if (credentials.refreshToken == null) {
        return AuthenticationState.Anonymous
      } else {
        return AuthenticationState.Authenticated
      }
    })
  }

  public async login(email: string, password: string): Promise<void> {
    const instanceId = await this.getDeviceId()
    const result = await this.apiService.login(email, password, instanceId)
    const credentials = this.mapCredentials(result)

    // We want to remove preferences as we may have saved an anonymous zipcode before
    await this.localStore.clearPreferences()
    await this.localStore.storeCredentials(credentials)
  }

  public async anonymousLogin(deviceId: string): Promise<Credentials> {
    const result = await this.apiService.anonymousLogin(deviceId)
    const credentials = this.mapCredentials(result)
    await this.localStore.storeCredentials(credentials)
    return credentials
  }

  public async refreshToken(refreshToken: string): Promise<Credentials> {
    try {
      const result = await this.apiService.refreshToken(refreshToken)
      const credentials = this.mapCredentials(result)
      await this.localStore.storeCredentials(credentials)
      return credentials
    } catch (error) {
      if (error instanceof RefreshTokenPermanentlyInvalidatedError) {
        await this.logout(false)
      }
      throw error
    }
  }

  public async logout(dissociateToken: boolean = true): Promise<void> {
    if (dissociateToken) {
      await this.pushRepository.dissociateToken()
    }
    await this.localStore.clearCredentials()
    await this.localStore.clearPreferences()
    await CacheManager.getInstance().purgeCache()
    try {
      await this.pushRepository.invalidatePushToken()
    } catch (error) {
      // logout should not be blocked if the user is offline
      console.log(error)
    }
    this.dispatchState(AuthenticationState.Unauthenticated)
  }

  public dispatchState(state: AuthenticationState) {
    const listener = this.stateListener
    if (listener) {
      listener(state)
    }
  }

  public getDeviceId(): Promise<string> {
    return iid().get()
  }

  private mapCredentials(result: RestLoginResponse): Credentials {
    return {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    }
  }

  public static getInstance(): AuthenticationRepository {
    if (!AuthenticationRepository.instance) {
      AuthenticationRepository.instance = new AuthenticationRepository()
    }

    return AuthenticationRepository.instance
  }
}

export default AuthenticationRepository
