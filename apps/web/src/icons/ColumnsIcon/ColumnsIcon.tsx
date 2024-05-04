import { SvgIcon, SvgIconProps } from '@mui/material';

export default function HomeIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14.25 21C13.85 21 13.5 20.85 13.2 20.55C12.9 20.25 12.75 19.9 12.75 19.5V4.5C12.75 4.1 12.9 3.75 13.2 3.45C13.5 3.15 13.85 3 14.25 3H19.5C19.9 3 20.25 3.15 20.55 3.45C20.85 3.75 21 4.1 21 4.5V19.5C21 19.9 20.85 20.25 20.55 20.55C20.25 20.85 19.9 21 19.5 21H14.25ZM14.25 4.5V19.5H19.5V4.5H14.25ZM4.5 21C4.1 21 3.75 20.85 3.45 20.55C3.15 20.25 3 19.9 3 19.5V4.5C3 4.1 3.15 3.75 3.45 3.45C3.75 3.15 4.1 3 4.5 3H9.75C10.15 3 10.5 3.15 10.8 3.45C11.1 3.75 11.25 4.1 11.25 4.5V19.5C11.25 19.9 11.1 20.25 10.8 20.55C10.5 20.85 10.15 21 9.75 21H4.5ZM4.5 4.5V19.5H9.75V4.5H4.5ZM19.5 4.5H14.25H19.5ZM9.75 4.5H4.5H9.75Z" />
    </SvgIcon>
  );
}