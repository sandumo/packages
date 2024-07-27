import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type BottomSheetProps = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  controls?: (props: { handleClose: () => void }) => React.ReactNode;
}

export default function BottomSheet({ children, open, onClose, controls }: BottomSheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (open) {
      // document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
    } else {
      // document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }
  }, [open]);

  useEffect(() => {
    if (ref.current) {
      ref.current.scroll({
        behavior: 'smooth',
        top: open ? 700 : 0,
      });

      setTimeout(() => {
        setFullyOpen(open);
      }, 400);
    }
  }, [ref, open]);

  const [fullyOpen, setFullyOpen] = useState(false);

  const handleClose = () => {
    if (ref.current) {
      ref.current.scroll({
        behavior: 'smooth',
        top: 0,
      });
    }
  };

  const t = (scrollY - 350) / (844 * 2.5);
  const backdropBackgroundColorOpacity = (t < 0 ? 0 : t);

  return (
    <>
      <Box sx={{ display: 'none', '@media (min-width: 600px)': { display: 'block' } }}>{children}</Box>
      <Box
        ref={ref}
        sx={{
          display: 'none',
          '@media (max-width: 600px)': { display: 'block' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,

          overflowY: 'scroll',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
          scrollSnapType: 'y mandatory',
          scrollPadding: '0px',
          '-webkit-overflow-scrolling': 'touch',
          pt: 40,

          bgcolor: `rgba(0, 0, 0, ${backdropBackgroundColorOpacity})`,

          ...(open ? {
            visibility: 'visible',
            opacity: 1,
          } : {
            visibility: 'hidden',
            opacity: 0,
          }),

        }}
        onClick={handleClose}
        onScroll={(e) => {
          setScrollY(e.currentTarget.scrollTop);

          if (fullyOpen && e.currentTarget.scrollTop <= 170) {
            onClose?.();
            setFullyOpen(false);
          }
        }}
      >
        <Box sx={{ height: '100dvh', scrollSnapAlign: 'start' }} />

        <Box
          sx={{
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            height: 'calc(100dvh)',
            pt: '64px',
            overflowY: 'hidden',
          }}
        >
          <Box sx={{
            bgcolor: 'background.paper',
            boxShadow: 4,
            borderRadius: '24px 24px 0px 0px',

            overflowY: 'scroll',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '-ms-overflow-style': 'none',
            scrollbarWidth: 'none',

            height: 'calc(100dvh - 64px)',

          }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{
              position: 'sticky',
              top: 0,
              backgroundImage: 'linear-gradient(to bottom, #fff 0%, #ffffff00 100%)',
              zIndex: 101,
              borderRadius: '24px 24px 0px 0px',
              px: 4,
              pb: 1,
            }}>
              <Box sx={{ py: 2 }}>
                <Box sx={{ width: 44, height: 4, bgcolor: '#DEDEDE', borderRadius: '8px', mx: 'auto' }} />
              </Box>
            </Box>
            <Box sx={{ px: 4, pb: 4 }}>
              {children}
            </Box>
            {controls && (
              <Box sx={{
                p: 4,

                // pb: 4,
                position: 'sticky',
                bottom: 0,
                bgcolor: '#fff',

                // boxShadow: 4,
                borderTop: '1px solid #00000010',
              }}>
                {controls({ handleClose })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
