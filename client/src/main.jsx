import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/css/bootstrap.rtl.min.css';

// import './styles/custom.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
