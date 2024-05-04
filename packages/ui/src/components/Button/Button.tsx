import { ButtonProps as MuiButtonProps, Button as MuiButton } from '@mui/material';
import NextLink from 'next/link';

type ButtonProps = MuiButtonProps & {
  children: React.ReactNode,
}

export default function Button({ href, children, ...props }: ButtonProps) {
  return (
    <MuiButton
      {...(href ? {
        // onClick: (e: any) => {
        //   e.preventDefault();
        //   router.push(href);
        // },
        href: href,
        component: NextLink,
      } : {})}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
