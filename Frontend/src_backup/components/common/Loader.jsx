import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ message = 'Loading...' }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
        >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="textSecondary" mt={3}>
                {message}
            </Typography>
        </Box>
    );
};

export default Loader;