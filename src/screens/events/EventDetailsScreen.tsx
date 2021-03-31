import React, { FC } from 'react'
import { StyleSheet, ScrollView, Image, View, Text } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { EventDetailsScreenProps } from '../../navigation'
import { Colors, Spacing, Styles, Typography } from '../../styles'
import { useTheme } from '../../themes'
import i18n from '../../utils/i18n'
import { BorderlessButton } from '../shared/Buttons'
import EventDetailsItemContainer from './EventDetailsItemContainer'
import { EventDetailsViewModel } from './EventDetailsViewModel'
import TagView from './TagView'

const EventDetailsScreen: FC<EventDetailsScreenProps> = ({ route }) => {
  const eventId = route.params.eventId
  const viewModel = mockedData
  const { theme } = useTheme()
  return (
    <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
      <ScrollView>
        <View style={styles.wrapImage}>
          {viewModel.imageUrl ? (
            <Image style={styles.image} source={{ uri: viewModel.imageUrl }} />
          ) : null}
        </View>
        <View style={styles.tagAttendeesContainer}>
          <TagView
            tag={viewModel.tag}
            tagBackgroundColor={viewModel.tagBackgroundColor}
            tagTextColor={viewModel.tagTextColor}
          />
          <Text style={styles.attendees}>{viewModel.attendeesNumber}</Text>
        </View>
        <Text style={styles.title}>{viewModel.title}</Text>
        <EventDetailsItemContainer
          icon={require('../../assets/images/iconCalendar.png')}
        >
          <View>
            <Text style={styles.rowItemTitle}>{viewModel.date.title}</Text>
            <Text style={styles.rowItemDescription}>
              {viewModel.date.description}
            </Text>
            <BorderlessButton
              title={i18n.t('eventdetails.add_calendar')}
              textStyle={Styles.eventSeeMoreButtonTextStyle(theme)}
              style={Styles.eventSeeMoreButtonContainer}
            />
          </View>
        </EventDetailsItemContainer>
        {viewModel.onlineUrl ? (
          <EventDetailsItemContainer
            icon={require('../../assets/images/iconCameraHome.png')}
          >
            <View>
              <Text style={styles.rowItemTitle}>
                {i18n.t('eventdetails.online_event')}
              </Text>
              <BorderlessButton
                title={i18n.t('eventdetails.access_online_event')}
                textStyle={Styles.eventSeeMoreButtonTextStyle(theme)}
                style={Styles.eventSeeMoreButtonContainer}
              />
            </View>
          </EventDetailsItemContainer>
        ) : null}
        {viewModel.address ? (
          <EventDetailsItemContainer
            icon={require('../../assets/images/iconAddress.png')}
          >
            <View>
              <Text style={styles.rowItemTitle}>
                {viewModel.address?.title}
              </Text>
              <Text style={styles.rowItemDescription}>
                {viewModel.address?.description}
              </Text>
            </View>
          </EventDetailsItemContainer>
        ) : null}
        <View style={styles.separator} />
        <EventDetailsItemContainer
          icon={require('../../assets/images/iconShare.png')}
        >
          <View>
            <Text style={styles.rowItemDescription}>{viewModel.eventUrl}</Text>
            <BorderlessButton
              title={i18n.t('eventdetails.share_event')}
              textStyle={Styles.eventSeeMoreButtonTextStyle(theme)}
              style={Styles.eventSeeMoreButtonContainer}
            />
          </View>
        </EventDetailsItemContainer>
        <View style={styles.separator} />
        <Text style={styles.subtitle}>
          {i18n.t('eventdetails.description')}
        </Text>
        <Text style={styles.description}>{viewModel.description}</Text>
        <BorderlessButton
          title={i18n.t('eventdetails.see_more')}
          textStyle={Styles.eventSeeMoreButtonTextStyle(theme)}
          style={[
            styles.descriptionSeeMore,
            Styles.eventSeeMoreButtonContainer,
          ]}
        />
        <View style={styles.separator} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  attendees: {
    ...Typography.body,
    alignSelf: 'flex-end',
    color: Colors.lightText,
    flexGrow: 1,
    textAlign: 'right',
  },
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
  description: {
    ...Typography.body,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.unit,
  },
  descriptionSeeMore: {
    marginHorizontal: Spacing.margin,
  },
  image: {
    height: 203,
  },
  rowItemDescription: {
    ...Typography.body,
    color: Colors.lightText,
  },
  rowItemTitle: {
    ...Typography.headline,
    fontSize: 14,
  },
  separator: {
    backgroundColor: Colors.separator,
    height: Spacing.separatorHeight,
    marginHorizontal: Spacing.margin,
    marginVertical: Spacing.margin,
  },
  subtitle: {
    ...Typography.headline,
    fontSize: 14,
    marginHorizontal: Spacing.margin,
  },
  tagAttendeesContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.margin,
  },
  title: {
    ...Typography.largeTitle,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.margin,
  },
  wrapImage: {
    minHeight: 130,
  },
})

const mockedData: EventDetailsViewModel = {
  id: '666',
  title: 'Élections : où quand, comment ?',
  tag: 'CONFERENCE',
  tagBackgroundColor: '#4489f7',
  tagTextColor: '#ffffff',
  attendeesNumber: '23 inscrits',
  onlineUrl: 'https://zoom.us/j/91611561795',
  address: {
    title: 'La Barrique',
    description: '7 rue Beaurepaire\n75010 Paris',
  },
  imageUrl:
    'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/980px-Olympique_lyonnais_%28logo%29.svg.png',
  isSubscribed: true,
  date: {
    title: 'Lundi 22 mars 2021',
    description: '12:00 - 15:00',
  },
  eventUrl: 'https://en-marche.fr/evenements/20',
  description:
    'Phasellus ac pharetra quam, a pretium sapien. Sed sit amet ipsum erat. Sed vulputate lectus porta, hendrerit leo quis, tincidunt nibh. Sed ut mi non sem viverra consectetur sollicitudin ac tortor. Sed lectus est, suscipit ac tortor ut, sagittis mattis nisl. Proin euismod nisl vitae risus hendrerit tristique. Proin ultrices diam nec nisi dignissim mollis. Vivamus consequat egestas mi eu volutpat. Sed hendrerit sagittis mi et ornare. Donec maximus ornare enim, sed scelerisque est venenatis id. Nulla com',
}

export default EventDetailsScreen