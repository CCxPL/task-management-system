import { createTheme } from '@mui/material/styles';

// Common typography and component settings
const commonTheme = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2.5rem' },
        h2: { fontWeight: 600, fontSize: '2rem' },
        h3: { fontWeight: 600, fontSize: '1.75rem' },
        h4: { fontWeight: 600, fontSize: '1.5rem' },
        h5: { fontWeight: 600, fontSize: '1.25rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 8 },
    shadows: [
        'none',
        '0px 2px 4px rgba(9, 30, 66, 0.08)',
        '0px 4px 8px rgba(9, 30, 66, 0.08)',
        '0px 6px 12px rgba(9, 30, 66, 0.08)',
        '0px 8px 16px rgba(9, 30, 66, 0.08)',
        ...Array(20).fill('none'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, padding: '8px 16px' },
                contained: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0px 2px 4px rgba(9, 30, 66, 0.16)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 8, boxShadow: '0px 2px 4px rgba(9, 30, 66, 0.08)' },
            },
        },
        MuiPaper: {
            styleOverrides: { root: { borderRadius: 8 } },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': { borderRadius: 8 },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { boxShadow: '0px 2px 4px rgba(9, 30, 66, 0.08)' },
            },
        },
    },
};

// Light theme (Jira-inspired) - Frontend Scope Document colors
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0052CC', // Jira blue
            light: '#4C9AFF',
            dark: '#0747A6',
        },
        secondary: {
            main: '#172B4D', // Dark blue-gray
            light: '#344563',
            dark: '#091E42',
        },
        success: {
            main: '#36B37E', // Green
            light: '#57D9A3',
            dark: '#006644',
        },
        warning: {
            main: '#FFAB00', // Yellow
            light: '#FFE380',
            dark: '#FF8B00',
        },
        error: {
            main: '#FF5630', // Red
            light: '#FF8F73',
            dark: '#DE350B',
        },
        info: {
            main: '#6554C0', // Purple
            light: '#8777D9',
            dark: '#403294',
        },
        background: {
            default: '#F4F5F7', // Light gray background
            paper: '#FFFFFF',
        },
        text: {
            primary: '#172B4D',
            secondary: '#6B778C',
        },
        divider: '#DFE1E6',
    },
    ...commonTheme,
});

// Dark theme
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#4C9AFF', // Brighter blue for dark mode
            light: '#6AB3FF',
            dark: '#2684FF',
        },
        secondary: {
            main: '#B3BAC5', // Light gray for dark mode
            light: '#C7CED9',
            dark: '#8993A4',
        },
        success: {
            main: '#57D9A3', // Brighter green
            light: '#79E2B8',
            dark: '#36B37E',
        },
        warning: {
            main: '#FFC400', // Brighter yellow
            light: '#FFD633',
            dark: '#FFAB00',
        },
        error: {
            main: '#FF7452', // Brighter red
            light: '#FF957A',
            dark: '#FF5630',
        },
        info: {
            main: '#8777D9', // Brighter purple
            light: '#9D91E0',
            dark: '#6554C0',
        },
        background: {
            default: '#0D1B2A', // Dark blue background
            paper: '#1B2638', // Dark cards
        },
        text: {
            primary: '#E6EDF6', // Light text
            secondary: '#B3BAC5', // Gray text
        },
        divider: '#2D3748',
    },
    components: {
        ...commonTheme.components,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1B2638',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#222D3E', // Slightly different from background.paper
                    backgroundImage: 'none', // Remove gradient in dark mode
                },
            },
        },
    },
    ...commonTheme,
});

// Default export (light theme for backward compatibility)
const theme = lightTheme;
export default theme;