import React, { FC, useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import {
  AddressComponent,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  PlaceType,
} from 'react-native-google-places-autocomplete'
import { TouchableRipple } from 'react-native-paper'
import { Colors, Spacing, Typography } from '../../styles'
import i18n from '../../utils/i18n'
import { NavigationHeaderButton } from '../shared/NavigationHeaderButton'
import { GOOGLE_PLACES_API_KEY } from '../../Config'
import { Address } from '../../core/entities/DetailedProfile'
import { profileRepository } from '../../di/DependencyProvider'

type Props = Readonly<{
  address: Address | undefined
  onAddressSelected: (address: Address) => void
}>

const extractComponent = (
  components: AddressComponent[] | undefined,
  searchedType: PlaceType,
): AddressComponent | undefined => {
  return components?.find((value) => {
    for (const type of value.types) {
      if (type === searchedType) {
        return true
      }
    }
    return false
  })
}

const extractAddress = (details: GooglePlaceDetail | null): Address => {
  const streetNumber = extractComponent(
    details?.address_components,
    'street_number',
  )?.long_name
  const streetAddress = extractComponent(details?.address_components, 'route')
    ?.long_name

  let fullAddress: string | undefined
  if (streetNumber === undefined && streetAddress === undefined) {
    fullAddress = undefined
  } else {
    fullAddress = (streetNumber ?? '') + ' ' + (streetAddress ?? '')
  }
  const postalCode = extractComponent(
    details?.address_components,
    'postal_code',
  )?.long_name
  const city = extractComponent(details?.address_components, 'locality')
    ?.long_name
  const countryCode = extractComponent(details?.address_components, 'country')
    ?.short_name
  return {
    address: fullAddress,
    postalCode: postalCode,
    country: countryCode,
    city: city,
  }
}

const stringifyAddress = (address: Address | undefined): string => {
  if (address === undefined) return ''
  let addressStr = address.address ?? ''
  if (addressStr !== '' && (address.postalCode || address.city)) {
    addressStr += ', '
  }
  addressStr += address.postalCode ?? ''
  if (address.postalCode) {
    addressStr += ' '
  }
  addressStr += address.city ?? ''
  if (addressStr !== '' && address.country) {
    addressStr += ', '
  }
  addressStr += address.country ?? ''
  return addressStr
}

const LocationPicker: FC<Props> = (props) => {
  const [modalVisible, setModalVisible] = useState(false)
  const onAddressSelected = async (details: GooglePlaceDetail | null) => {
    let address = extractAddress(details)

    if (address.postalCode) {
      let newCity: string | undefined

      try {
        const cityFound = await profileRepository.getCityFromPostalCode(
          address.postalCode,
        )
        newCity = cityFound ? cityFound : address.city
      } catch (error) {
        newCity = address.city
      }
      address = {
        address: address.address,
        postalCode: address.postalCode,
        city: newCity,
        country: address.country,
      }
    }

    props.onAddressSelected(address)
    setModalVisible(false)
  }

  return (
    <View>
      <TouchableRipple
        onPress={() => {
          setModalVisible(true)
        }}
      >
        <Text
          style={[
            styles.commonText,
            props.address ? styles.selectedAddress : styles.placeholder,
          ]}
        >
          {props.address
            ? stringifyAddress(props.address)
            : i18n.t('personalinformation.placeholder')}
        </Text>
      </TouchableRipple>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <NavigationHeaderButton
              source={require('../../assets/images/navigationBarBack.png')}
              onPress={() => setModalVisible(false)}
            />
            <Text style={styles.headerTitle}>
              {i18n.t('personalinformation.address')}
            </Text>
          </View>
          <GooglePlacesAutocomplete
            placeholder={i18n.t('common.search')}
            fetchDetails={true}
            onPress={(_, details) => {
              onAddressSelected(details)
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: i18n.t('personalinformation.gmaps_language'),
            }}
            styles={{
              textInputContainer: {
                paddingTop: Spacing.unit,
                paddingHorizontal: Spacing.margin,
              },
              textInput: {
                color: Colors.darkText,
                backgroundColor: Colors.separator,
              },
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  commonText: {
    ...Typography.body,
    paddingVertical: 4,
    textAlign: 'right',
  },
  container: { backgroundColor: Colors.defaultBackground, flex: 1 },
  headerContainer: {
    flexDirection: 'row',
  },
  headerTitle: {
    ...Typography.title2,
    alignSelf: 'center',
    flexGrow: 1,
    marginEnd: 44,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  placeholder: {
    color: Colors.lightText,
  },
  selectedAddress: {
    color: Colors.darkText,
  },
})

export default LocationPicker
