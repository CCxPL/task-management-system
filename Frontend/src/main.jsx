import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext.jsx'
import { lightTheme, darkTheme } from './styles/theme.js'
import App from './App.jsx'
import { store } from './app/store.js'
import './index.css'


// ThemedApp component MUST be inside CustomThemeProvider
const ThemedApp = () => {
  const { darkMode } = useTheme()

  return (
    <MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemedApp />
        </LocalizationProvider>
      </CustomThemeProvider>
    </Provider>
  </React.StrictMode>
)