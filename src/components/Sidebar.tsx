// components/Sidebar.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;
const closedWidth = 60;

interface SidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
    return (
        <Drawer
            variant="permanent"
            open={open}
            PaperProps={{
                sx: {
                    overflowX: 'hidden',
                    width: open ? drawerWidth : closedWidth,
                    transition: 'width 0.3s',
                }
            }}
        >
            {/* Header / Toggle button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>
            </Box>
            <Divider />

            {/* Menu items */}
            <List>
                {[
                    { text: 'Users', icon: <PeopleIcon />, href: '/users' },
                    { text: 'Settings', icon: <SettingsIcon />, href: '/settings' },
                ].map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : 'auto',
                                    justifyContent: 'center',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}
