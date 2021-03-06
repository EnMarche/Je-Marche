import React, { FC } from 'react'
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { Colors, Spacing, Typography } from '../../styles'
import { useThemedStyles } from '../../themes'
import Theme from '../../themes/Theme'
import CardView from '../shared/CardView'
import { TouchablePlatform } from '../shared/TouchablePlatform'
import { EventRowViewModel } from './EventViewModel'
import TagView from './TagView'

type Props = Readonly<{
  style?: StyleProp<ViewStyle>
  viewModel: EventRowViewModel
  onEventSelected: (eventId: string) => void
}>

const EventGridItem: FC<Props> = ({ viewModel, style, onEventSelected }) => {
  const styles = useThemedStyles(stylesFactory)
  return (
    <CardView
      style={[styles.card, style]}
      backgroundColor={Colors.defaultBackground}
    >
      <TouchablePlatform
        touchHighlight={Colors.touchHighlight}
        onPress={() => onEventSelected(viewModel.id)}
      >
        <View style={styles.container}>
          {viewModel.imageUrl ? (
            <Image source={{ uri: viewModel.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
          <View style={styles.leftColumn}>
            <TagView viewModel={viewModel.tag} />
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
              {viewModel.isOnline ? (
                <View style={styles.webcamIconContainer}>
                  <Image
                    style={styles.webcamIcon}
                    source={require('../../assets/images/videocam.png')}
                  />
                </View>
              ) : null}
              {viewModel.title}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.date}>{viewModel.date}</Text>
              {viewModel.isSubscribed ? (
                <Text style={styles.subscribed}>
                  <Image
                    style={styles.checkIcon}
                    source={require('../../assets/images/checkIcon.png')}
                  />
                  {'\n'}
                  Inscrit
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </TouchablePlatform>
    </CardView>
  )
}

const stylesFactory = (theme: Theme) => {
  return StyleSheet.create({
    card: {
      marginHorizontal: Spacing.margin,
      marginVertical: Spacing.unit,
      width: 170,
    },
    checkIcon: {
      tintColor: theme.primaryColor,
    },
    container: {
      flexDirection: 'column',
      minHeight: 212,
    },
    date: {
      ...Typography.body,
      color: Colors.lightText,
      flexGrow: 1,
      flexShrink: 1,
      marginBottom: Spacing.unit,
      marginStart: Spacing.unit,
      marginTop: Spacing.unit,
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      flexGrow: 1,
    },
    image: {
      height: 86,
    },
    imagePlaceholder: {
      backgroundColor: Colors.groupedListBackground,
    },
    leftColumn: {
      alignItems: 'flex-start',
      flexGrow: 1,
      flexShrink: 1,
    },
    rightColumn: {
      alignItems: 'flex-end',
    },
    subscribed: {
      marginEnd: Spacing.unit,
      marginVertical: Spacing.unit,
      ...Typography.caption1,
      color: theme.primaryColor,
    },
    title: {
      ...Typography.eventItemTitle,
      marginHorizontal: Spacing.unit,
      marginTop: Spacing.unit,
    },
    webcamIcon: {
      borderRadius: 2,
      height: 16,
      resizeMode: 'contain',
      width: 24,
    },
    webcamIconContainer: {
      paddingRight: Spacing.unit,
    },
  })
}

export default EventGridItem
