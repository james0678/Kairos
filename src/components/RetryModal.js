import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import { useCalendar } from '../contexts/CalendarContext';

export const RetryModal = ({ onRetry }) => {
  const { failedEvent, isRetryModalOpen, setIsRetryModalOpen } = useCalendar();

  const handleRetry = () => {
    onRetry();
    setIsRetryModalOpen(false);
  };

  return (
    <Dialog 
      open={isRetryModalOpen}
      onClose={() => setIsRetryModalOpen(false)}
      keepMounted  // 다른 탭으로 이동해도 DOM에서 제거되지 않음
    >
      <DialogTitle>
        Kairos Event 업데이트에 실패했습니다. 다시 시도하시겠습니까?
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setIsRetryModalOpen(false)}>
          취소
        </Button>
        <Button onClick={handleRetry} color="primary" variant="contained">
          다시 시도
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 