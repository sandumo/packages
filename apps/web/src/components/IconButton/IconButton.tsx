import { IconButtonProps as MuiIconButtonProps, IconButton as MuiIconButton } from '@mui/material';
import { useRouter } from 'next/router';

type IconButtonProps = MuiIconButtonProps & {
  href?: string;
}

export default function IconButton({ href, children, ...props }: IconButtonProps) {
  const router = useRouter();

  return (
    <MuiIconButton
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
    </MuiIconButton>
  );
}
