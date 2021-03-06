import ky from 'ky'
import { API_BASE_URL } from '../../Config'
import LocalStore from '../store/LocalStore'
import AuthenticationRepository from '../AuthenticationRepository'
import { Mutex } from 'async-mutex'

const injectAccessTokenHook = async (request: Request) => {
  const credentials = await LocalStore.getInstance().getCredentials()
  if (credentials == null || request.headers.has('Authorization')) {
    // don't inject accessToken
    return request
  } else {
    request.headers.set('Authorization', `Bearer ${credentials.accessToken}`)
    return request
  }
}

const refreshTokenMutex = new Mutex()

const refreshToken = async (options: { request: Request }) => {
  const requestAccessToken = extractAccessToken(options.request)
  return refreshTokenMutex.runExclusive(async () => {
    const credentials = await LocalStore.getInstance().getCredentials()
    if (credentials == null) {
      return
    }
    const tokenHasBeenRefreshed = credentials.accessToken !== requestAccessToken
    if (tokenHasBeenRefreshed) {
      return
    }

    const authenticationRepository = AuthenticationRepository.getInstance()
    if (credentials.refreshToken) {
      await authenticationRepository.refreshToken(credentials.refreshToken)
    } else {
      const deviceId = await authenticationRepository.getDeviceId()
      await authenticationRepository.anonymousLogin(deviceId)
    }
    const newCredentials = await LocalStore.getInstance().getCredentials()
    options.request.headers.set(
      'Authorization',
      `Bearer ${newCredentials?.accessToken}`,
    )
  })
}

function extractAccessToken(request: Request): string | null {
  const headerValue = request.headers.get('Authorization')
  if (headerValue == null) return null
  const accessToken = headerValue.replace(/^Bearer /, '')
  return accessToken
}

const baseHttpClient = ky.create({
  prefixUrl: API_BASE_URL,
})

const httpClient = baseHttpClient.extend({
  retry: {
    limit: 2,
    statusCodes: [401],
  },
  hooks: {
    beforeRequest: [injectAccessTokenHook],
    beforeRetry: [refreshToken],
  },
})

export default httpClient
