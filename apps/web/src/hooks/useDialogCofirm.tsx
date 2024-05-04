import { DialogConfirmContext } from '@context/DialogConfirmContext';
import { useContext } from 'react';

export const useDialogConfirm = () => useContext(DialogConfirmContext);
