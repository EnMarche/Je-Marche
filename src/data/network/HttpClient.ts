import ky from 'ky'
import { API_BASE_URL } from '../../Config'
import LocalStore from '../store/LocalStore'
import { Mutex } from 'async-mutex'
import { authenticationRepository } from '../../di/DependencyProvider'

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

    if (credentials.refreshToken) {
      return authenticationRepository.refreshToken(credentials.refreshToken)
    } else {
      return authenticationRepository.anonymousLogin()
    }
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
