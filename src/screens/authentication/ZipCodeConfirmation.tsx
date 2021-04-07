import React, { FunctionComponent, useEffect, useState } from 'react'
import { Alert, Image, StyleSheet, Text } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { Department } from '../../core/entities/Department'
import RegionsRepository from '../../data/RegionsRepository'
import { makeAnonymousLoginInteractor } from '../../di/DependencyProvider'
import { ZipCodeConfirmationScreenProps } from '../../navigation'
import { Colors, Spacing, Typography } from '../../styles'
import { useTheme } from '../../themes'
import i18n from '../../utils/i18n'
import { PrimaryButton } from '../shared/Buttons'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import LoadingOverlay from '../shared/LoadingOverlay'
import { StatefulView, ViewState } from '../shared/StatefulView'

type ContentProps = Readonly<{
  department: string
  zipCode: string
}>

const ZipCodeConfirmationContent: FunctionComponent<ContentProps> = ({
  department,
  zipCode,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()

  const displayError = (error: string) => {
    Alert.alert(
      i18n.t('common.error_title'),
      error,
      [
        {
          text: i18n.t('common.error_retry'),
          onPress: authenticate,
        },
        {
          text: i18n.t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: false },
    )
  }

  const authenticate = () => {
    setIsLoading(true)
    const anonymousLoginInteractor = makeAnonymousLoginInteractor()
    anonymousLoginInteractor
      .login(zipCode)
      .catch((error) => displayError(GenericErrorMapper.mapErrorMessage(error)))
      .finally(() => setIsLoading(false))
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <Image style={styles.logo} source={theme.image.region()} />
      <Text style={styles.title}>
        {i18n.t('zipcodeconfirmation.title', { department: department })}
      </Text>
      <Text style={styles.description}>
        {i18n.t('zipcodeconfirmation.description')}
      </Text>
      <PrimaryButton
        style={styles.continueButton}
        title={i18n.t('zipcodeconfirmation.continue')}
        onPress={authenticate}
      />
    </SafeAreaView>
  )
}

const ZipCodeConfirmationScreen = ({
  route,
}: ZipCodeConfirmationScreenProps) => {
  const zipCode = route.params.zipCode

  const [statefulState, setStatefulState] = useState<
    ViewState.Type<Department>
  >(new ViewState.Loading())

  useEffect(() => {
    const fetchData = () => {
      RegionsRepository.getInstance()
        .getDepartment(zipCode, 'remote', 'Anonymous')
        .then((department) => {
          setStatefulState(new ViewState.Content(department))
        })
        .catch((error) => {
          setStatefulState(
            new ViewState.Error(
              GenericErrorMapper.mapErrorMessage(error),
              () => {
                setStatefulState(new ViewState.Loading())
                fetchData()
              },
            ),
          )
        })
    }

    fetchData()
  }, [zipCode])

  return (
    <StatefulView
      state={statefulState}
      contentComponent={(department) => {
        return (
          <ZipCodeConfirmationContent
            department={department.name}
            zipCode={route.params.zipCode}
          />
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
  continueButton: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.mediumMargin,
  },
  description: {
    ...Typography.body,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.margin,
  },
  logo: {
    alignSelf: 'center',
    height: 180,
    marginTop: Spacing.unit,
    width: 320,
  },
  title: {
    ...Typography.largeTitle,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.unit,
  },
})

export default ZipCodeConfirmationScreen
