import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

export const AutoEndModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>자동 종료 알림</DialogTitle>
      <DialogContent>
        <Typography>
          이벤트 종료를 잊으신 것 같아 자동으로 종료해드렸어요.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 