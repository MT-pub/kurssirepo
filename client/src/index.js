import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { IntlProvider } from 'react-intl';
import messages_fi from './translations/fi.json'
import messages_en from './translations/en.json'
import { SnackbarProvider } from 'notistack'

const messages = {
  'fi': messages_fi,
  'en': messages_en
}
const language = navigator.language.split(/[-_]/)[0] //language without region code

ReactDOM.render(
  <React.StrictMode>
    <IntlProvider locale={language} messages={messages[language]}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} variant="info">
        <App />
      </SnackbarProvider>
    </IntlProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
