export interface QuickEvent {
  id: string;
  title: string;
  color: string;
  iconName: keyof typeof IconNames;
  type: 'quick';
  isCustom?: boolean;
}

export enum IconNames {
  list = 'list',
  walk = 'walk',
  game = 'game',
  food = 'food',
  study = 'study',
  work = 'work',
  fitness = 'fitness',
  cafe = 'cafe',
  book = 'book',
  music = 'music',
  sports = 'sports',
  art = 'art',
  movie = 'movie',
  code = 'code',
  phone = 'phone',
  shopping = 'shopping',
  home = 'home',
  pet = 'pet',
  car = 'car',
  flight = 'flight',
  favorite = 'favorite',
  star = 'star',
  time = 'time',
} 