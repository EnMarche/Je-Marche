import { CountryCode, isCountryCode } from 'react-native-country-picker-modal'
import {
  Address,
  DetailedProfile,
  PhoneNumber,
} from '../../core/entities/DetailedProfile'
import { Profile } from '../../core/entities/Profile'
import i18n from '../../utils/i18n'
import {
  RestDetailedProfileResponse,
  RestPhoneNumber,
  RestPostAddress,
} from '../restObjects/RestDetailedProfileResponse'
import { RestProfileResponse } from '../restObjects/RestProfileResponse'
import { GenderMapper } from './GenderMapper'

export const ProfileMapper = {
  map: (result: RestProfileResponse): Profile => {
    return {
      firstName: result.first_name,
      lastName: result.last_name,
      uuid: result.uuid,
      zipCode: result.postal_code,
      totalSurveys: result.surveys.total,
      totalSurveysLastMonth: result.surveys.last_month,
    }
  },
  mapDetailedProfile: (
    result: RestDetailedProfileResponse,
  ): DetailedProfile => {
    let nationality: CountryCode
    if (isCountryCode(result.nationality)) {
      nationality = result.nationality
    } else {
      // by default
      nationality = i18n.t('personalinformation.default_country_code')
    }
    return {
      uuid: result.uuid,
      firstName: result.first_name,
      lastName: result.last_name,
      gender: GenderMapper.mapToGender(result.gender),
      customGender: result.custom_gender ?? undefined,
      nationality: nationality,
      birthDate: new Date(result.birthdate),
      address: postAddress(result.post_address),
      email: result.email_address ?? undefined,
      facebook: result.facebook_page_url ?? undefined,
      linkedin: result.linkedin_page_url ?? undefined,
      twitter: result.twitter_page_url ?? undefined,
      telegram: result.telegram_page_url ?? undefined,
      phone: phoneNumber(result.phone),
      isCertified: result.certified,
    }
  },
}

const postAddress = (restPostAddress: RestPostAddress | null): Address => {
  return {
    address: restPostAddress?.address ?? undefined,
    postalCode: restPostAddress?.postal_code ?? undefined,
    city: restPostAddress?.city_name ?? undefined,
    country: restPostAddress?.country ?? undefined,
  }
}

const phoneNumber = (
  restPhoneNumber: RestPhoneNumber | null,
): PhoneNumber | undefined => {
  if (restPhoneNumber == null) return undefined

  let countryCode: CountryCode
  if (isCountryCode(restPhoneNumber.country)) {
    countryCode = restPhoneNumber.country
  } else {
    // by default
    countryCode = i18n.t('personalinformation.default_country_code')
  }
  return {
    countryCode: countryCode,
    number: restPhoneNumber.number,
  }
}
