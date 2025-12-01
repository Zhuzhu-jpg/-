import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: undefined,
      errorInfo: undefined
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-pink-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              哎呀，出错了！
            </h2>
            
            <p className="text-slate-600 mb-4">
              应用程序遇到了一个意外错误。请尝试刷新页面或返回首页。
            </p>
            
            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-50 rounded-lg text-left">
                <p className="text-sm font-mono text-slate-500 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="bg-pink-300 text-white font-bold py-3 px-6 rounded-full hover:bg-pink-400 transition active:scale-95"
              >
                刷新页面
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="bg-white text-pink-300 font-bold py-3 px-6 rounded-full border border-pink-300 hover:bg-pink-50 transition active:scale-95"
              >
                返回首页
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                如果问题持续存在，请联系技术支持
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
