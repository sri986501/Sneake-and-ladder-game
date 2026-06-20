import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Provider } from 'react-redux'
import store from './store'
import { setupMockAPI } from './utils/apiMock'

// Intercept port 5000 API requests and handle them in-browser via localStorage
setupMockAPI(true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
