import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Colors, Spacing, Typography } from '../../styles'
import i18n from '../../utils/i18n'
import KeyboardOffsetView from '../shared/KeyboardOffsetView'
import CertifiedProfileView from './CertifiedProfileView'
import LabelInputContainer from './LabelInputContainer'
import LabelTextInput from './LabelTextInput'
import GenderPicker from './GenderPicker'
import BirthdayPicker from './BirthdayPicker'
import CountryPicker from 'react-native-country-picker-modal'
import LocationPicker from './LocationPicker'
import {
  PersonalInformationScreenProps,
  ProfileParamList,
} from '../../navigation'
import { StatefulView, ViewState } from '../shared/StatefulView'
import {
  DetailedProfile,
  FormViolation,
} from '../../core/entities/DetailedProfile'
import ProfileRepository from '../../data/ProfileRepository'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import { Gender } from '../../core/entities/UserProfile'
import PhoneNumberInput from './PhoneNumberInput'
import LoadingOverlay from '../shared/LoadingOverlay'
import { StackNavigationProp } from '@react-navigation/stack'
import { ProfileFormError } from '../../core/errors'
import { useThemedStyles } from '../../themes'
import Theme from '../../themes/Theme'
import { PersonalInformationsForm } from '../../core/entities/PersonalInformationsForm'
import { PersonalInformationsFormMapper } from '../../core/mapper/PersonalInformationsFormMapper'

type ContentProps = Readonly<{
  profileUuid: string
  isCertified: boolean
  initialForm: PersonalInformationsForm
  navigation: StackNavigationProp<ProfileParamList, 'PersonalInformation'>
}>

const PersonalInformationScreenContent: FC<ContentProps> = ({
  profileUuid,
  isCertified,
  initialForm,
  navigation,
}) => {
  const [form, updateForm] = useState<PersonalInformationsForm>(initialForm)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<Array<FormViolation>>([])
  const firstNameRef = useRef<TextInput>(null)
  const lastNameRef = useRef<TextInput>(null)
  const genderOther = useRef<TextInput>(null)
  const facebookRef = useRef<TextInput>(null)
  const linkedInRef = useRef<TextInput>(null)
  const twitterRef = useRef<TextInput>(null)
  const telegramRef = useRef<TextInput>(null)
  const styles = useThemedStyles(stylesFactory)

  const getError = (violations: Array<FormViolation>, path: string): string => {
    return violations
      .filter((error) => error.propertyPath.startsWith(path))
      .map((value) => value.message)
      .reduce((previous, current) => {
        return previous + current + '\n'
      }, '')
  }

  const submit = useCallback(() => {
    const displayError = (error: string) => {
      console.log('Displaying error ', error)
      Alert.alert(
        i18n.t('common.error_title'),
        error,
        [
          {
            text: i18n.t('common.error_retry'),
            onPress: submit,
          },
          {
            text: i18n.t('common.cancel'),
            style: 'cancel',
          },
        ],
        { cancelable: false },
      )
    }
    setIsLoading(true)
    setErrors([])
    ProfileRepository.getInstance()
      .updateDetailedProfile(profileUuid, form)
      .then(() => navigation.goBack())
      .catch((error) => {
        if (error instanceof ProfileFormError) {
          setErrors(error.violations)
        } else {
          displayError(GenericErrorMapper.mapErrorMessage(error))
        }
      })
      .finally(() => setIsLoading(false))
  }, [profileUuid, form, navigation])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>
            {i18n.t('personalinformation.cancel')}
          </Text>
        </TouchableOpacity>
      ),
      title: i18n.t('personalinformation.title'),
      headerRight: () => (
        <TouchableOpacity onPress={submit}>
          <Text style={[styles.headerButtonText, styles.headerSubmit]}>
            {i18n.t('personalinformation.save')}
          </Text>
        </TouchableOpacity>
      ),
      headerTitleStyle: styles.title,
    })
  }, [navigation, submit, styles])

  const genderListener = (value: Gender) => {
    updateForm({ ...form, gender: value })
  }
  const onDateChange = (_: string, newDate: Date) => {
    updateForm({ ...form, birthdate: newDate })
  }
  return (
    <KeyboardOffsetView>
      <ScrollView
        style={styles.mainContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LoadingOverlay visible={isLoading} />
        <View style={styles.container}>
          <CertifiedProfileView
            style={styles.certifiedContainer}
            isCertified={isCertified}
          />
          <Text style={styles.section}>
            {i18n.t('personalinformation.section_identity')}
          </Text>
          <LabelTextInput
            ref={firstNameRef}
            nextInput={lastNameRef}
            label={i18n.t('personalinformation.first_name')}
            textInputProps={{
              textContentType: 'givenName',
            }}
            defaultValue={initialForm.firstName}
            onValueChange={(value) => updateForm({ ...form, firstName: value })}
            errorMessage={getError(errors, 'first_name')}
            disabled={isCertified}
          />
          <LabelTextInput
            ref={lastNameRef}
            label={i18n.t('personalinformation.last_name')}
            textInputProps={{
              textContentType: 'familyName',
            }}
            defaultValue={initialForm.lastName}
            onValueChange={(value) => updateForm({ ...form, lastName: value })}
            errorMessage={getError(errors, 'last_name')}
            disabled={isCertified}
          />
          <GenderPicker
            onValueChange={genderListener}
            defaultValue={form.gender}
            errorMessage={getError(errors, 'gender')}
            disabled={isCertified}
          />
          {form.gender === Gender.Other ? (
            <LabelTextInput
              ref={genderOther}
              label={i18n.t('personalinformation.gender_other')}
              defaultValue={initialForm.customGender}
              onValueChange={(value) =>
                updateForm({ ...form, customGender: value })
              }
              disabled={isCertified}
            />
          ) : null}
          <LabelInputContainer
            label={i18n.t('personalinformation.birthdate')}
            errorMessage={getError(errors, 'birthdate')}
            disabled={isCertified}
          >
            <BirthdayPicker
              date={form.birthdate}
              onDateChange={onDateChange}
              disabled={isCertified}
            />
          </LabelInputContainer>
          <LabelInputContainer
            label={i18n.t('personalinformation.nationality')}
            errorMessage={getError(errors, 'nationality')}
          >
            <CountryPicker
              countryCode={form.countryCode}
              preferredCountries={[
                i18n.t('personalinformation.default_country_code'),
              ]}
              withFlagButton={false}
              translation={i18n.t(
                'personalinformation.country_picker_language',
              )}
              // @ts-ignore: Issue in the country picker typescript definition
              closeButtonImage={require('../../assets/images/navigationBarBack.png')}
              withCountryNameButton={true}
              containerButtonStyle={styles.countryPickerContainerButton}
              withFlag={false}
              theme={Typography.countryPicker}
              // @ts-ignore: Issue in the country picker typescript definition
              flatListProps={{
                contentContainerStyle: { paddingHorizontal: Spacing.margin },
              }}
              onSelect={(country) => {
                updateForm({ ...form, countryCode: country.cca2 })
              }}
            />
          </LabelInputContainer>
          <Text style={styles.section}>
            {i18n.t('personalinformation.section_coordinates')}
          </Text>
          <LabelInputContainer
            label={i18n.t('personalinformation.address')}
            errorMessage={getError(errors, 'address')}
          >
            <LocationPicker
              address={form.address}
              onAddressSelected={(pickedAddress) => {
                updateForm({ ...form, address: pickedAddress })
              }}
            />
          </LabelInputContainer>
          <LabelTextInput
            label={i18n.t('personalinformation.email')}
            textInputProps={{
              keyboardType: 'email-address',
              textContentType: 'emailAddress',
              autoCapitalize: 'none',
              autoCorrect: false,
            }}
            defaultValue={initialForm.email}
            onValueChange={(value) => updateForm({ ...form, email: value })}
            errorMessage={getError(errors, 'email_address')}
          />
          <PhoneNumberInput
            defaultValue={initialForm.phoneNumber}
            label={i18n.t('personalinformation.phone')}
            nextInput={facebookRef}
            onValueChange={(value) =>
              updateForm({ ...form, phoneNumber: value })
            }
            errorMessage={getError(errors, 'phone')}
          />
          <Text style={styles.section}>
            {i18n.t('personalinformation.section_social')}
          </Text>
          <LabelTextInput
            ref={facebookRef}
            nextInput={linkedInRef}
            label={i18n.t('personalinformation.facebook')}
            defaultValue={initialForm.facebook}
            onValueChange={(value) => updateForm({ ...form, facebook: value })}
            errorMessage={getError(errors, 'facebook_page_url')}
          />
          <LabelTextInput
            ref={linkedInRef}
            nextInput={twitterRef}
            label={i18n.t('personalinformation.linkedin')}
            defaultValue={initialForm.linkedin}
            onValueChange={(value) => updateForm({ ...form, linkedin: value })}
            errorMessage={getError(errors, 'linkedin_page_url')}
          />
          <LabelTextInput
            ref={twitterRef}
            nextInput={telegramRef}
            label={i18n.t('personalinformation.twitter')}
            defaultValue={initialForm.twitter}
            onValueChange={(value) => updateForm({ ...form, twitter: value })}
            errorMessage={getError(errors, 'twitter_page_url')}
          />
          <LabelTextInput
            ref={telegramRef}
            isLastInput={true}
            label={i18n.t('personalinformation.telegram')}
            defaultValue={initialForm.telegram}
            onValueChange={(value) => updateForm({ ...form, telegram: value })}
            errorMessage={getError(errors, 'telegram_page_url')}
          />
        </View>
      </ScrollView>
    </KeyboardOffsetView>
  )
}

const PersonalInformationScreen = ({
  navigation,
}: PersonalInformationScreenProps) => {
  const [statefulState, setStatefulState] = useState<
    ViewState.Type<DetailedProfile>
  >(new ViewState.Loading())

  useEffect(() => {
    const fetchData = () => {
      ProfileRepository.getInstance()
        .getDetailedProfile()
        .then((detailedProfile) => {
          setStatefulState(new ViewState.Content(detailedProfile))
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
  }, [])

  return (
    <StatefulView
      state={statefulState}
      contentComponent={(detailedProfile) => {
        const form = PersonalInformationsFormMapper.mapFromDetailedProfile(
          detailedProfile,
        )
        return (
          <PersonalInformationScreenContent
            profileUuid={detailedProfile.uuid}
            isCertified={detailedProfile.isCertified}
            navigation={navigation}
            initialForm={form}
          />
        )
      }}
    />
  )
}
const stylesFactory = (theme: Theme) => {
  return StyleSheet.create({
    mainContainer: {
      backgroundColor: Colors.defaultBackground,
    },
    container: {
      padding: Spacing.margin,
      flex: 1,
    },
    certifiedContainer: {},
    section: {
      ...Typography.caption1,
      color: Colors.lightText,
      marginTop: Spacing.margin,
    },
    headerButtonText: {
      ...Typography.headline,
      fontSize: 14,
      paddingHorizontal: Spacing.margin,
    },
    headerSubmit: {
      color: theme.primaryColor,
    },
    title: {
      ...Typography.title2,
      paddingHorizontal: Spacing.mediumMargin,
    },
    countryPickerContainerButton: {
      alignSelf: 'flex-end',
    },
  })
}

export default PersonalInformationScreen
