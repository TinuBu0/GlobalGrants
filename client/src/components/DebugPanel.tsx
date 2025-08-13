import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bug, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { type DebugMessage } from "@/types/grants";

let debugMessageId = 0;
const debugMessages: DebugMessage[] = [];
const debugListeners: ((messages: DebugMessage[]) => void)[] = [];

// Global debug function
(window as any).debugLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const debugMessage: DebugMessage = {
    id: (++debugMessageId).toString(),
    message,
    type,
    timestamp: new Date(),
  };
  
  debugMessages.unshift(debugMessage);
  
  // Keep only last 50 messages
  if (debugMessages.length > 50) {
    debugMessages.pop();
  }
  
  // Notify all listeners
  debugListeners.forEach(listener => listener([...debugMessages]));
  
  console.log(`[OIMF Debug - ${type.toUpperCase()}]: ${message}`);
};

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<DebugMessage[]>([]);
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    // Add this component as a listener
    debugListeners.push(setMessages);
    
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      (window as any).debugLog(
        `JavaScript error: ${event.message} at ${event.filename}:${event.lineno}`,
        'error'
      );
    };

    // Promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      (window as any).debugLog(
        `Unhandled promise rejection: ${event.reason}`,
        'error'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Initial debug message
    (window as any).debugLog('OIMF Debug Panel initialized', 'success');

    return () => {
      // Remove this component from listeners
      const index = debugListeners.indexOf(setMessages);
      if (index > -1) {
        debugListeners.splice(index, 1);
      }
      
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const errorCount = messages.filter(msg => msg.type === 'error').length;
    setHasErrors(errorCount > 0);
    
    // Auto-show panel on errors
    if (errorCount > 0 && !isVisible) {
      setIsVisible(true);
    }
  }, [messages, isVisible]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const clearMessages = () => {
    debugMessages.length = 0;
    setMessages([]);
    setHasErrors(false);
  };

  if (!isVisible && !hasErrors) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white"
        size="sm"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible && hasErrors && (
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
          size="sm"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Errors ({messages.filter(msg => msg.type === 'error').length})
        </Button>
      )}
      
      {isVisible && (
        <Card className="w-80 max-h-96 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Bug className="h-4 w-4 mr-2" />
                Debug Console
                {hasErrors && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {messages.filter(msg => msg.type === 'error').length} errors
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                <Button
                  onClick={clearMessages}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500">No debug messages</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs p-2 rounded border-l-2 ${
                      msg.type === 'error' ? 'border-red-500 bg-red-50' :
                      msg.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      msg.type === 'success' ? 'border-green-500 bg-green-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {getIcon(msg.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
