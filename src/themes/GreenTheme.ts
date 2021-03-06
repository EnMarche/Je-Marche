import RegionTheme from '../core/entities/RegionTheme'
import { Colors } from '../styles'
import Theme from './Theme'

const chateauGreen = '#44ae64'
const chateauGreen80Light = '#69BE83'
const chateauGreen50Light = '#A2D7B2'
const offwhite = '#F8FFF8'
const fringyFlower = '#c9ebc9'

const GreenTheme: Theme = {
  id: RegionTheme.GREEN,
  primaryColor: chateauGreen,
  lightBackground: offwhite,
  primaryButtonBackgroundDisabled: chateauGreen80Light,
  primaryButtonBackgroundHighlight: chateauGreen50Light,
  primaryButtonTextColor: Colors.white,
  coloredText: chateauGreen,
  quickPollProgress: fringyFlower,
  image: {
    near: () => require('../assets/images/green/imageProche.png'),
    reforms: () => require('../assets/images/green/imageReformes.png'),
    covid: () => require('../assets/images/green/imageCovid.png'),
    desintox: () => require('../assets/images/green/imageDesintox.png'),
    answers: () => require('../assets/images/green/imageReponses.png'),
    error: () => require('../assets/images/green/imageErreur.png'),
    emptyPoll: () => require('../assets/images/green/imageSondage.png'),
    pollImage1: () => require('../assets/images/green/imageSondage01.png'),
    pollImage2: () => require('../assets/images/green/imageSondage02.png'),
    pollImage3: () => require('../assets/images/green/imageSondage03.png'),
    pollImage4: () => require('../assets/images/green/imageSondage04.png'),
    pollSuccess: () => require('../assets/images/green/imageMerci.png'),
    pollTools: () =>
      require('../assets/images/green/navigationBarLeftAccessoriesOutils.png'),
    profile: () => require('../assets/images/green/imageProfil.png'),
    profilePoll: () => require('../assets/images/green/imageSondageProfil.png'),
    region: () => require('../assets/images/green/imageRegion.png'),
    homeNews: () => require('../assets/images/green/imageActualite.png'),
    homeTools: () => require('../assets/images/green/imageOutilsprofil.png'),
    zipCode: () => require('../assets/images/green/imageCodePostal.png'),
    notification: () => require('../assets/images/green/imageNotification.png'),
  },
}

export default GreenTheme
