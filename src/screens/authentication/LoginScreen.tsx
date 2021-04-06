import React, { FC, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput } from 'react-native'
import i18n from '../../utils/i18n'
import { CredentialsInvalidError } from '../../core/errors'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import SafeAreaView from 'react-native-safe-area-view'
import { Colors, Spacing, Typography } from '../../styles'
import { BorderlessButton, PrimaryButton } from '../shared/Buttons'
import LabelTextInput from '../shared/LabelTextInput'
import LoadingOverlay from '../shared/LoadingOverlay'
import RegionTheme from '../../core/entities/RegionTheme'
import { useTheme } from '../../themes'
import { ExternalLink } from '../shared/ExternalLink'
import { DependencyProvider } from '../../di/DependencyProvider'

type Props = Readonly<{
  onSuccess?: () => void
}>

const LoginScreen: FC<Props> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isLoading, setLoading] = useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = useState<
    string | undefined
  >(undefined)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<
    string | undefined
  >(undefined)
  const passwordInputRef = useRef<TextInput>(null)
  const { setTheme } = useTheme()

  const isLoginEnabled = (): boolean => {
    return email.length > 0 && password.length > 0
  }

  const onFormSubmitted = () => {
    setLoading(true)
    setEmailErrorMessage(undefined)
    setPasswordErrorMessage(undefined)
    const loginInteractor = DependencyProvider.sharedInstance().makeLoginInteractor()
    loginInteractor
      .login(email, password)
      .then((theme: RegionTheme) => {
        setTheme(theme)
        onSuccess?.()
      })
      .catch((exception) => {
        if (exception instanceof CredentialsInvalidError) {
          setPasswordErrorMessage(i18n.t('login.credentials_error'))
        } else {
          setPasswordErrorMessage(GenericErrorMapper.mapErrorMessage(exception))
        }
        setEmailErrorMessage('')
        console.log('user authentication failure')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <Text style={styles.title}>{i18n.t('login.title')}</Text>
      <LabelTextInput
        style={styles.input}
        label={i18n.t('login.email')}
        errorMessage={emailErrorMessage}
        textInputProps={{
          keyboardType: 'email-address',
          textContentType: 'emailAddress',
          autoCapitalize: 'none',
          autoCorrect: false,
          returnKeyType: 'next',
          autoFocus: true,
          autoCompleteType: 'email',
          onChangeText: (text) => {
            setEmail(text)
          },
          onSubmitEditing: () => {
            passwordInputRef.current?.focus()
          },
        }}
      />
      <LabelTextInput
        ref={passwordInputRef}
        style={styles.input}
        label={i18n.t('login.password')}
        errorMessage={passwordErrorMessage}
        textInputProps={{
          textContentType: 'password',
          autoCapitalize: 'none',
          autoCorrect: false,
          secureTextEntry: true,
          onChangeText: (text) => {
            setPassword(text)
          },
          returnKeyType: 'done',
        }}
      />
      <PrimaryButton
        disabled={!isLoginEnabled()}
        style={styles.submitButton}
        title={i18n.t('login.login')}
        onPress={onFormSubmitted}
      />
      <BorderlessButton
        style={styles.passwordLostButton}
        title={i18n.t('login.password_lost')}
        onPress={() => {
          ExternalLink.openUrl(i18n.t('login.password_lost_url'))
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
  input: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.margin,
  },
  inputLabel: {
    ...Typography.headline,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.unit,
  },
  passwordLostButton: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.unit,
  },
  submitButton: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.mediumMargin,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.mediumMargin,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.unit,
  },
})

export default LoginScreen
