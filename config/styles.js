import { StyleSheet } from 'react-native';
import colors from '../config/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlurple: {
    backgroundColor: colors.blurple,
  },
  bgBlue: {
    backgroundColor: colors.blue,
  },
  bgPrimary: {
    backgroundColor: colors.primary,
  },
  bgSecondary: {
    backgroundColor: colors.secondary,
  },
  bgThird: {
    backgroundColor: colors.third,
  },
  bgNavbar: {
    backgroundColor: colors.navbar,
  },
  bgBlack: {
    backgroundColor: colors.black,
  },
  bgYellow: {
    backgroundColor: colors.yellow,
  },
  bgFuchsia: {
    backgroundColor: colors.fuchsia,
  },
  bgWhite: {
    backgroundColor: colors.white,
  },
  bgGreen: {
    backgroundColor: colors.green,
  },
  bgRed: {
    backgroundColor: colors.red,
  },
  bgDark: {
    backgroundColor: colors.dark,
  },
  borderRadius: {
    borderRadius: 8,
  },
  padding: {
    padding: 10,
  },
  textWhite: {
    color: colors.white,
  },
  bold: {
    fontWeight: 'bold',
  },
  largeTitle: {
    fontSize: 26,
    },
  mediumTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 20,
  },
  buttonGray:{
    backgroundColor: colors.third,
    padding: 10,
    borderRadius: 9999,
    alignItems: 'center',
    borderWidth: 0.2,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  buttonBlurple:{
    backgroundColor: colors.blurple,
    padding: 10,
    borderRadius: 9999,
    alignItems: 'center',
    borderWidth: 0.2,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  textGray: {
    color: "#8E909C",
    fontWeight: 'bold',
  },
  paddingG: {
    paddingHorizontal: 15,
  }
});

export default styles;
