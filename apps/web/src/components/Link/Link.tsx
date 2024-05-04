import { Box, SxProps } from '@mui/material';
import { useRouter } from 'next/router';

interface LinkProps {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
  sx?: SxProps;
  className?: string; // It's especially used for PopupMenu link items
  primary?: boolean;
}

export default function Link({ children, href, sx, className, primary = false, target = '_self', rel = '' }: LinkProps) {
  const router = useRouter();

  return (
    <Box
      component="a"
      onClick={(e: any) => {
        e.preventDefault();

        if (target == '_blank') {
          window.open(href, '_blank');
        } else {
          router.push(href);
        }
      }}
      sx={{
        textDecoration: 'none',
        color: primary ? 'primary.main' : 'inherit',
        ...(sx ? sx : {}),
      }}

      rel={rel}
      href={href}
      {...(className ? { className } : {})}
    >
      {children}
    </Box>
  );
}
