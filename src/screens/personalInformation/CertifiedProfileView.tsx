import React, { FC } from 'react'
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { Colors, Typography } from '../../styles'
import i18n from '../../utils/i18n'
import { PrimaryButton } from '../shared/Buttons'
import { ExternalLink } from '../shared/ExternalLink'

type Props = Readonly<{
  style?: StyleProp<ViewStyle>
  isCertified: boolean
}>

const CertifiedProfileView: FC<Props> = ({ style, isCertified }) => {
  const certifiedText = isCertified
    ? i18n.t('personalinformation.certified.text')
    : i18n.t('personalinformation.uncertified.text')
  return (
    <View style={[style, styles.certifiedContainer]}>
      <View style={styles.certifiedContentContainer}>
        <Text style={styles.certifiedText}>{certifiedText}</Text>
        {!isCertified ? (
          <PrimaryButton
            style={styles.buttonContainer}
            buttonStyle={styles.buttonInnerStyle}
            textStyle={styles.buttonTextStyle}
            title={i18n.t('personalinformation.uncertified.button')}
            onPress={() =>
              ExternalLink.openUrl(
                i18n.t('personalinformation.uncertified.url'),
              )
            }
          />
        ) : null}
      </View>
      <Image
        style={styles.certifiedImage}
        source={require('../../assets/images/imagesProfilInfosCertif.png')}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonInnerStyle: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  buttonTextStyle: {
    ...Typography.caption1,
  },
  certifiedContainer: {
    backgroundColor: Colors.groupedListBackground,
    flexDirection: 'row',
  },
  certifiedContentContainer: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    padding: 16,
  },
  certifiedImage: {
    alignSelf: 'flex-end',
  },
  certifiedText: {
    ...Typography.caption1,
    color: Colors.shipGray,
  },
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
})

export default CertifiedProfileView
