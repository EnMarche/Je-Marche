import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { FunctionComponent } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { RootStackParamList, Screen } from '.'
import { AuthenticationState } from '../core/entities/AuthenticationState'
import AnonymousLoginZipCodeScreen from '../screens/authentication/AnonymousLoginZipCodeScreen'
import LoginScreen from '../screens/authentication/LoginScreen'
import TermsOfUseScreen from '../screens/authentication/TermsOfUseScreen'
import UnauthenticatedHomeScreen from '../screens/authentication/UnauthenticatedHomeScreen'
import ZipCodeConfirmationScreen from '../screens/authentication/ZipCodeConfirmation'
import AuthenticatedHomeScreen from '../screens/AuthenticatedHomeScreen'
import PollDetailModal from '../screens/pollDetail/PollDetailModal'
import { headerBlank } from '../styles/navigationAppearance'
import { PushNotification } from '../utils/PushNotification'
import DataCollectScreen from '../screens/authentication/DataCollectScreen'
import { Analytics } from '../utils/Analytics'
import {
  authenticationRepository,
  pushRepository,
} from '../di/DependencyProvider'

const RootStack = createStackNavigator<RootStackParamList>()
const UnauthenticatedStack = createStackNavigator()

const Navigator: FunctionComponent = () => {
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)
  authenticationRepository.stateListener = (state) => {
    updateFromState(state)
  }

  const updateFromState = (authenticationState: AuthenticationState) => {
    if (authenticationState === AuthenticationState.Unauthenticated) {
      Analytics.disable()
      setLoggedIn(false)
    } else {
      PushNotification.requestPermission()
      Analytics.enable()
      pushRepository.subscribeToGeneralTopic().catch((error) => {
        console.log(error)
      })
      setLoggedIn(true)
    }
    SplashScreen.hide()
  }

  useEffect(() => {
    authenticationRepository.getAuthenticationState().then(updateFromState)
  }, [])

  if (isLoggedIn === undefined) {
    return null
  } else if (isLoggedIn) {
    return (
      <RootStack.Navigator mode="modal" headerMode="none">
        <RootStack.Screen
          name={Screen.authenticatedHome}
          component={AuthenticatedHomeScreen}
        />
        {/* We need PollDetailScreen at this level because poll detail
          should be presented above the tab bar (i.e the HomeScreen) */}
        <RootStack.Screen
          name={Screen.pollDetailModal}
          component={PollDetailModal}
          options={{ gestureEnabled: false }}
        />
      </RootStack.Navigator>
    )
  } else {
    return (
      <UnauthenticatedStack.Navigator screenOptions={headerBlank}>
        <UnauthenticatedStack.Screen
          name={Screen.unauthenticatedHome}
          component={UnauthenticatedHomeScreen}
          options={{ headerShown: false }}
        />
        <UnauthenticatedStack.Screen
          name={Screen.login}
          component={LoginScreen}
        />
        <UnauthenticatedStack.Screen
          name={Screen.anonymousLoginZipCode}
          component={AnonymousLoginZipCodeScreen}
        />
        <UnauthenticatedStack.Screen
          name={Screen.zipCodeConfirmation}
          component={ZipCodeConfirmationScreen}
        />
        <UnauthenticatedStack.Screen
          name={Screen.dataCollect}
          component={DataCollectScreen}
        />
        <UnauthenticatedStack.Screen
          name={Screen.termsOfUse}
          component={TermsOfUseScreen}
        />
      </UnauthenticatedStack.Navigator>
    )
  }
}

export default Navigator
