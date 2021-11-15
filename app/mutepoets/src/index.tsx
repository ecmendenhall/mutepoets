import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import config from './config/dapp'
import { Helmet } from 'react-helmet'
import { DAppProvider } from '@usedapp/core'

import '@fontsource/josefin-sans'
import '@fontsource/montserrat'

import montserrat from '@fontsource/montserrat/files/montserrat-latin-400-normal.woff2'
import josefinSans from '@fontsource/josefin-sans/files/josefin-sans-latin-400-normal.woff2'

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <link rel="preload" as="font" href={montserrat} type="font/woff2" />
      <link rel="preload" as="font" href={josefinSans} type="font/woff2" />
    </Helmet>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
