const Error = ({ message, onRetry }) => {
    const displayMessage = Array.isArray(message)
        ? message.join("")
        : message;

    return (
        <Box textAlign="center" py={5}>
            <Alert
                severity="error"
                variant="outlined"
                sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}
            >
                <Typography variant="body1">
                    {displayMessage}
                </Typography>
            </Alert>

            {onRetry && (
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={onRetry}
                >
                    Retry
                </Button>
            )}
        </Box>
    );
};
