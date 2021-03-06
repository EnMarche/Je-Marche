import React, { FC } from 'react'
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Colors, Spacing, Typography } from '../../styles'
import { useThemedStyles } from '../../themes'
import Theme from '../../themes/Theme'
import { TouchablePlatform } from './TouchablePlatform'

type Props = Readonly<{
  viewModel: SelectableIconLabelViewModel
  onSelected: (code: string) => void
}>

export interface SelectableIconLabelViewModel {
  code: string
  label: string
  image: ImageSourcePropType
  isSelected: boolean
}

const SelectableIconLabelView: FC<Props> = ({ viewModel, onSelected }) => {
  const styles = useThemedStyles(stylesFactory)
  const containerStyle = viewModel.isSelected
    ? styles.containerSelected
    : styles.containerUnselected
  const labelStyle = viewModel.isSelected ? styles.labelSelected : undefined
  const imageStyle = viewModel.isSelected
    ? styles.imageSelected
    : styles.imageUnselected
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchablePlatform
        touchHighlight={Colors.touchHighlight}
        onPress={() => {
          onSelected(viewModel.code)
        }}
      >
        <View style={styles.innerContainer}>
          <Image style={imageStyle} source={viewModel.image} />
          <Text style={[styles.label, labelStyle]} numberOfLines={2}>
            {viewModel.label}
          </Text>
        </View>
      </TouchablePlatform>
    </View>
  )
}

const stylesFactory = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      borderRadius: 4,
      borderWidth: 2,
      flex: 1,
      marginHorizontal: Spacing.small,
      marginVertical: Spacing.small,
    },
    containerSelected: {
      borderColor: theme.primaryColor,
    },
    containerUnselected: {
      borderColor: Colors.defaultBackground,
    },
    imageSelected: {
      tintColor: theme.primaryColor,
    },
    imageUnselected: {
      tintColor: Colors.lightText,
    },
    innerContainer: {
      alignItems: 'center',
      height: 94,
      justifyContent: 'center',
      padding: Spacing.small,
    },
    label: {
      ...Typography.body,
      marginTop: Spacing.unit,
      textAlign: 'center',
      tintColor: Colors.darkText,
    },
    labelSelected: {
      color: theme.primaryColor,
    },
  })
}

export default SelectableIconLabelView
