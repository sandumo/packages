import { ButtonProps as MuiButtonProps } from '@mui/material';
import MuiButton from '@mui/material/Button';
import { useRouter } from 'next/router';

export type ButtonProps = MuiButtonProps;

export default function Button({ href, children, ...props }: ButtonProps) {
  const router = useRouter();

  return (
    <MuiButton
      {...(href ? {
        onClick: (e: any) => {
          e.preventDefault();
          router.push(href);
        },
        href: href,
      } : {})}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
