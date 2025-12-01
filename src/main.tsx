import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // 如果有的话

// 添加错误边界
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
