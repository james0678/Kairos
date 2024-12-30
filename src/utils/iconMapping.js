import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BookIcon from '@mui/icons-material/Book';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import BrushIcon from '@mui/icons-material/Brush';
import MovieIcon from '@mui/icons-material/Movie';
import CodeIcon from '@mui/icons-material/Code';
import PhoneIcon from '@mui/icons-material/Phone';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import PetsIcon from '@mui/icons-material/Pets';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import WatchIcon from '@mui/icons-material/Watch';

// Simpler icon mapping with shorter names
export const iconMapping = {
  list: FormatListBulletedIcon,
  walk: DirectionsWalkIcon,
  game: SportsEsportsIcon,
  food: RestaurantIcon,
  study: SchoolIcon,
  work: WorkIcon,
  fitness: FitnessCenterIcon,
  cafe: LocalCafeIcon,
  book: BookIcon,
  music: MusicNoteIcon,
  sports: SportsBasketballIcon,
  art: BrushIcon,
  movie: MovieIcon,
  code: CodeIcon,
  phone: PhoneIcon,
  shopping: ShoppingCartIcon,
  home: HomeIcon,
  pet: PetsIcon,
  car: DirectionsCarIcon,
  flight: FlightIcon,
  favorite: FavoriteIcon,
  star: StarIcon,
  time: WatchIcon,
  // Add a default icon for custom events
  custom: FormatListBulletedIcon,
};

console.log('Icon mapping:', iconMapping); // Debug log

export const defaultQuickEvents = [
  {
    id: 'moving',
    title: '이동 시간',
    color: '#FF6B6B',
    iconName: 'walk',
  },
  {
    id: 'leisure',
    title: '여가 시간',
    color: '#4ECDC4',
    iconName: 'game',
  },
  {
    id: 'meal',
    title: '식사 시간',
    color: '#FFD93D',
    iconName: 'food',
  },
  {
    id: 'focus',
    title: '집중 시간',
    color: '#6C5CE7',
    iconName: 'study',
  },
];

console.log('Default events:', defaultQuickEvents); // Debug log 