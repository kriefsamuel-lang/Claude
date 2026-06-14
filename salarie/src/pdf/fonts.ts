import { Font } from '@react-pdf/renderer';

export function registerFonts() {
  Font.register({
    family: 'Rubik',
    fonts: [
      { src: '/fonts/Rubik-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Rubik-Bold.ttf',    fontWeight: 700 },
    ],
  });
}
