import { red, pink, /* ... other colors */ } from '@mui/material/colors';
import { IconNames } from '../types/quickEvent';

export const QUICK_EVENT_CONSTANTS = {
  STORAGE_KEYS: {
    CUSTOM_EVENTS: 'customQuickEvents',
    EVENTS_ORDER: 'quickEventsOrder',
    DELETED_EVENTS: 'deletedQuickEvents',
    PENDING_EVENT: 'pendingQuickEvent',
  },
  DEFAULT_COLOR: '#757575',
  DEFAULT_ICON: IconNames.list,
};

export const colorOptions = [
  { name: 'Red', value: red[500] },
  // ... other colors
];

export const iconOptions = [
  { name: IconNames.list, icon: FormatListBulletedIcon },
  // ... other icons
]; 