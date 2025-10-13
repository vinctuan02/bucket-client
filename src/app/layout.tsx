// app/layout.tsx
'use client';
import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from '../components/Sidebar';

const drawerWidth = 240;
const closedWidth = 60;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <html lang="vi">
      <head>
        <title>Next.js Sidebar Example</title>
      </head>
      <body>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          {/* Sidebar cố định bên trái */}
          <Sidebar open={open} setOpen={setOpen} />

          {/* Nội dung chính */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              transition: 'margin 0.3s',
              ml: open ? `${drawerWidth}px` : `${closedWidth}px`,
            }}
          >
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}
