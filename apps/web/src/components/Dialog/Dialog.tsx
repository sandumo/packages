import { Box, IconButton } from '@mui/material';
import { Button } from 'ui/components';
import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { handleSubmit } from '@utils';
import { useState } from 'react';

export type DialogBasicProps = {
  open: boolean;
  onClose: () => void;
}

interface DialogProps<T> {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  onSubmit?: (data: T) => Promise<void>;
  closeButtonLabel?: string;
  confirmButtonLabel?: string;
  children: React.ReactNode | (({ errors }: { errors: Record<string, string | undefined | null> }) => React.ReactNode);
  hideControls?: boolean;
  isForm?: boolean;
  width?: number;
  getFormValidationErrors?: (data: T) => Record<string, string | undefined | null>;
}

export default function Dialog<T extends Record<string, any>>({
  title,
  open,
  onClose,
  onConfirm,
  onSubmit,
  closeButtonLabel = 'Cancel',
  confirmButtonLabel = 'Save',
  children,
  hideControls = false,
  isForm = false,
  width,
  getFormValidationErrors,
}: DialogProps<T>) {
  const [pending, setPending] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | undefined | null>>({});

  return (
    <MuiDialog open={open} onClose={onClose} sx={{ '& > .MuiBackdrop-root': { bgcolor: '#00000070' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title}
        <IconButton onClick={onClose} sx={{ m: -1 }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ minWidth: 320, maxWidth: 800, ...(width ? { width } : {}) }}>
        {isForm && onSubmit ? (
          <Box
            id="dialog-form"
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(async (data: T) => {
              setPending(true);
              const errors = getFormValidationErrors ? getFormValidationErrors(data) : {};

              setErrors(errors);

              if (Object.values(errors).filter(err => typeof err === 'string').length === 0) {
                await onSubmit(data)
                  .then(() => {
                    onClose();
                  })
                  .catch(() => {});
              }
              setPending(false);
            })}
          >
            {typeof children === 'function' ? children({ errors }) : children}
          </Box>
        ) : typeof children === 'function' ? children({ errors }) : children}
      </DialogContent>
      {hideControls ? null : (
        <DialogActions>
          <Button sx={{ fontSize: 16, px: '24px!important' }} variant="text" color="error" onClick={onClose}>{closeButtonLabel}</Button>
          <Button

            // size="small"
            sx={{
              // height: 36,
              fontSize: 16,

              // fontWeight: 500,
              px: '24px!important',
              boxShadow: 0,
              '&:hover': {
                boxShadow: 0,
              },
            }}

            // variant="contained"
            {...(onSubmit ? {
              type: 'submit',
              form: 'dialog-form',
            } : {
              onClick: async () => { setPending(true); await onConfirm?.(); setPending(false); onClose(); },
            })}
          >
            {pending ? 'Saving' : confirmButtonLabel}
          </Button>
        </DialogActions>
      )}
    </MuiDialog>
  );
}
