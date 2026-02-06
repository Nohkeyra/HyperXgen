import React, { useState, useEffect, Suspense, lazy } from 'react';

// Lazy load heavy components
const BootScreen = lazy(() => import('./components/BootScreen.tsx'));
const MainInterface = lazy(() => import('./components/MainInterface.tsx'));

function LoadingFallback() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#FD1E4A' }}>HYPERXGEN</h1>
      <p>Loading minimal core...</p>
    </div>
  );
}

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  
  // Minimal boot logic - show something immediately
  useEffect(() => {
    console.log('App: Minimal boot started');
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1000); // Only 1 second boot time
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      {isBooting ? <BootScreen /> : <MainInterface />}
    </Suspense>
  );
};

export default App;
