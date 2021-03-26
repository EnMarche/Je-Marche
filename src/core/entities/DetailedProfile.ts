import { CountryCode } from 'react-native-country-picker-modal'
import { Gender } from './UserProfile'

export interface DetailedProfile {
  uuid: string
  isCertified: boolean
  firstName: string
  lastName: string
  gender: Gender
  customGender: string | undefined
  nationality: CountryCode
  birthDate: Date
  address: Address | undefined
  email: string
  facebook: string | undefined
  twitter: string | undefined
  linkedin: string | undefined
  telegram: string | undefined
  phone: PhoneNumber | undefined
}

export interface Address {
  address: string | undefined
  postalCode: string | undefined
  city: string | undefined
  country: string | undefined
}

export interface PhoneNumber {
  countryCode: CountryCode
  number: string
}

export interface FormViolation {
  propertyPath: string
  message: string
}
