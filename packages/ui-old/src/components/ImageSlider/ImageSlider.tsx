import { Box, SxProps } from '@mui/material';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type ImageSliderProps<T> = {
  open: boolean;
  onClose: () => void;
  sx?: SxProps
  images: T[];
  getImageURL?: (image: T) => string;
}

export default function ImageSlider<T>({
  open,
  onClose,
  images,
  getImageURL = (image: T) => image as unknown as string,
  sx,
}: ImageSliderProps<T>) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // const [open, setOpen] = useState(false);

  const [currentImage, setCurrentImage] = useState<T>(images[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // let timeout: NodeJS.Timeout;

    // if (ref.current) {
    //   const v = index * ((ref.current.scrollWidth - (items.length - 1) * 24) / items.length) + (items.length - 1) * 24;

    //   const px = Number(window.getComputedStyle(ref.current).getPropertyValue('padding-left').split('px')[0]);

    //   const itemWidth = (ref.current.scrollWidth - px * 2 - (items.length - 1) * 24) / items.length;
    //   const left = index * itemWidth + index * 24;

    //   ref.current.scroll({
    //     behavior: 'smooth',
    //     left: left,
    //   });

    //   timeout = setTimeout(() => setIndex(index + 1 >= items.length ? 0 : index + 1), 5000);
    // }

    // return () => clearTimeout(timeout);
  }, [index, ref]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#00000080',
        backdropFilter: 'blur(10px)',
        zIndex: 1,
      }}
      onClick={() => onClose()}
    >
      <Box
        ref={ref}
        sx={{
          // bgcolor: 'red',

          // height: '400px',
          overflowX: 'scroll',
          overflowY: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
          scrollPadding: {
            xs: '.5rem',
            sm: '1.5rem',
          },
          position: 'relative',
          whiteSpace: 'nowrap',
          '& > *': {
            display: 'inline-block!important',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',

            // width: {
            //   xs: 'calc(100%)',

            //   // sm: 'calc((100% - 1.5rem) / 2)',
            //   // md: 'calc((100% - 4.5rem) / 4)',
            // },
          },
          '& > * > *': {
            borderRadius: '16px',

            // boxShadow: 4,
            position: 'relative',
            overflow: 'hidden',

            // height: 360,
            zIndex: 1,

            // p: 4,
          },
          '& > *:not(:last-child)': {
            // mr: 6,
          },
          height: '100%',
          px: {
            xs: 2,
            sm: 6,
          },
          pt: {
            xs: 2,
            sm: 6,
          },
          pb: {
            xs: '52px',
            sm: '64px',
          },

          ...sx,
        }}
        onScroll={(e) => {
          setCurrentIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth));
        }}
      >
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              height: '100%',
              position: 'relative',
              width: '100%',
              mx: 6,
            }}
          >
            <Image src={'/api/storage/' + getImageURL(image)} fill style={{ objectFit: 'contain' }} alt="" unoptimized />
          </Box>
        ))}
      </Box>
      <Box sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        pb: {
          xs: 4,
          sm: 6,
        },
      }}>
        <Box sx={{ bgcolor: '#00000080', py: .5, px: 2, borderRadius: 1, color: '#fff' }}>
          {currentIndex + 1} / {images.length}
        </Box>
      </Box>
    </Box>
  );
}
