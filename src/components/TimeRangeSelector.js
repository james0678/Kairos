import { Box, ToggleButtonGroup, ToggleButton, Button, Menu } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useState } from 'react';
import { CustomTimeRangePicker } from './CustomTimeRangePicker';

export const TimeRangeSelector = ({ onRangeChange }) => {
  const [selectedPreset, setSelectedPreset] = useState('today');
  const [anchorEl, setAnchorEl] = useState(null);

  const presets = [
    { id: 'today', label: '오늘 (00:00-23:59)' },
    { id: 'night', label: '야간 (18:00-다음날 06:00)' },
    { id: 'custom', label: '커스텀 설정' }
  ];

  const handlePresetChange = (event, newPreset) => {
    if (!newPreset) return;
    setSelectedPreset(newPreset);
    
    switch (newPreset) {
      case 'today':
        onRangeChange({
          start: new Date().setHours(0, 0, 0, 0),
          end: new Date().setHours(23, 59, 59, 999)
        });
        break;
      case 'night':
        const start = new Date().setHours(18, 0, 0, 0);
        const end = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(6, 0, 0, 0);
        onRangeChange({ start, end });
        break;
      default:
        // custom 케이스는 별도 처리 없음
        break;
    }
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <ToggleButtonGroup
        value={selectedPreset}
        exclusive
        onChange={handlePresetChange}
        size="small"
      >
        {presets.map(preset => (
          <ToggleButton key={preset.id} value={preset.id}>
            {preset.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      
      {selectedPreset === 'custom' && (
        <Button
          startIcon={<AccessTimeIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          시간 범위 설정
        </Button>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <CustomTimeRangePicker
          onSelect={(range) => {
            onRangeChange(range);
            setAnchorEl(null);
          }}
        />
      </Menu>
    </Box>
  );
}; 