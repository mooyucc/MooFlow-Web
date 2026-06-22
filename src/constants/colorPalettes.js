/** 配色方案（name 为 i18n key） */
export const COLOR_PALETTES = [
  { name: 'palette_rhythm', colors: ['#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#3B53C4', '#D94A8A'] },
  { name: 'palette_eternal', colors: ['#3B53C4', '#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#A24AD9'] },
  { name: 'palette_flower', colors: ['#A12B3A', '#5DBA4A', '#3A9BDB', '#1B3A5B', '#A24AD9', '#4A1B3A'] },
  { name: 'palette_gorgeous', colors: ['#F15A4A', '#F6C244', '#3A9BDB', '#3B53C4', '#A24AD9', '#D94A8A'] },
  { name: 'palette_perfume', colors: ['#A18B4A', '#5DBA4A', '#3A9BDB', '#3B53C4', '#A24AD9', '#4A1B3A'] },
  { name: 'palette_cream', colors: ['#3A9BDB', '#3B53C4', '#F15A4A', '#F6C244', '#5DBA4A', '#1BC4A1'] },
  { name: 'palette_coral', colors: ['#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#A24AD9', '#D94A8A'] },
  { name: 'palette_champagne', colors: ['#C4BBA1', '#B4C4A1', '#A1C4B4', '#A1B4C4', '#C4A1B4', '#B4A1C4'] },
  { name: 'palette_zen', colors: ['#FFFFFF', '#E0E0E0', '#B0B0B0', '#707070', '#303030', '#000000'] },
];

export const ALL_PALETTE_COLORS = COLOR_PALETTES.flatMap(p => p.colors);
