import { Dialog } from '@components';
import { createContext, ReactNode, useState } from 'react';

type CallbackType = () => (Promise<void> | void | any);

type DialogConfirmType = {
  confirm: (message: string, callback: CallbackType) => void;
}

const defaultProvider: DialogConfirmType = {
  confirm: () => Promise.resolve(),
};

const DialogConfirmContext = createContext(defaultProvider);

type Props = {
  children: ReactNode
}

const DialogConfirmProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [callback, setCallback] = useState<CallbackType>();

  const handleConfirm = (message: string, callback: CallbackType) => {
    setOpen(true);
    setMessage(message);
    setCallback(() => callback);
  };

  const values = {
    confirm: handleConfirm,
  };

  return (
    <DialogConfirmContext.Provider value={values}>
      {children}
      <Dialog
        title={message}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={callback}
        confirmButtonLabel="Confirm"
      >
        {/* {message} */}{''}
      </Dialog>
    </DialogConfirmContext.Provider>
  );
};

export { DialogConfirmContext, DialogConfirmProvider };

