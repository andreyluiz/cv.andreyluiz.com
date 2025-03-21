import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './main.css';

const element = document.getElementById('root');

if (!element) {
  throw new Error('Root element not found');
}

createRoot(element).render(<App />);
