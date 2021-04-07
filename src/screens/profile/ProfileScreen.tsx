import React, { FC, useCallback, useState } from 'react'
import { StyleSheet, SafeAreaView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import { Colors } from '../../styles'
import { ProfileScreenProps } from '../../navigation'
import { StatefulView, ViewState } from '../shared/StatefulView'
import ProfileAnonymous from './ProfileAnonymous'
import { Screen } from '../../navigation'
import ProfileAuthenticated from './ProfileAuthenticated'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import {
  GetUserProfileInteractorResult,
  ProfileAnonymousResult,
  ProfileAuthenticatedResult,
} from '../../core/interactor/GetUserProfileInteractor'
import { ProfileScreenViewModelMapper } from './ProfileScreenViewModelMapper'
import { ServerTimeoutError } from '../../core/errors'
import { makeGetUserProfileInteractor } from '../../di/DependencyProvider'

const ProfileScreen: FC<ProfileScreenProps> = ({ navigation }) => {
  const [statefulState, setStatefulState] = useState<
    ViewState.Type<GetUserProfileInteractorResult>
  >(new ViewState.Loading())

  const ProfileDispatcher = (content: GetUserProfileInteractorResult) => {
    if (content instanceof ProfileAnonymousResult) {
      const openZipCode = () => {
        navigation.navigate(Screen.profileZipCode, {
          zipCode: content.zipCode,
        })
      }
      const openTermsOfUse = () => {
        navigation.navigate(Screen.profileTermsOfUse)
      }
      const openDataProtection = () => {
        navigation.navigate(Screen.profileDataProtection)
      }

      const openLogin = () => {
        navigation.navigate(Screen.profileLogin)
      }
      const viewModel = ProfileScreenViewModelMapper.mapFromDepartment(
        content.department,
      )
      return (
        <ProfileAnonymous
          openTermsOfUse={openTermsOfUse}
          openDataProtection={openDataProtection}
          openLogin={openLogin}
          openZipCode={openZipCode}
          viewModel={viewModel}
        />
      )
    } else if (content instanceof ProfileAuthenticatedResult) {
      const openPersonalInformation = () => {
        navigation.navigate(Screen.personalInformation)
      }
      const viewModel = ProfileScreenViewModelMapper.map(
        content.profile,
        content.department,
      )
      return (
        <ProfileAuthenticated
          openPersonalInformation={openPersonalInformation}
          viewModel={viewModel}
        />
      )
    } else {
      throw Error('unreachable')
    }
  }

  useFocusEffect(
    useCallback(() => {
      const getProfileInteractor = makeGetUserProfileInteractor()
      const remoteDataFetch = (cacheJustLoaded: boolean = false) => {
        getProfileInteractor
          .execute('remote')
          .then((result) => {
            setStatefulState(new ViewState.Content(result))
          })
          .catch((error) => {
            console.error(error)
            const isNetworkError = error instanceof ServerTimeoutError
            if (isNetworkError && cacheJustLoaded) {
              return
            }
            setStatefulState(
              new ViewState.Error(GenericErrorMapper.mapErrorMessage(error)),
            )
          })
      }

      setStatefulState(new ViewState.Loading())
      getProfileInteractor
        .execute('cache')
        .then((cachedProfile) => {
          setStatefulState(new ViewState.Content(cachedProfile))
          remoteDataFetch(true)
        })
        .catch(() => {
          remoteDataFetch()
        })
    }, []),
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatefulView
        state={statefulState}
        contentComponent={ProfileDispatcher}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
})

export default ProfileScreen
