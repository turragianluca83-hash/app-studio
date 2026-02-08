
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Il caricamento del Service Worker tramite Blob URL non è supportato in questo ambiente.
// Per mantenere l'app funzionale e senza errori in console, rimuoviamo la registrazione automatica.

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
