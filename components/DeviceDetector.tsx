
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

export interface DeviceInfo {
  pixelRatio: number;
  isTouch: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  safeAreaInsetTop: number;
  safeAreaInsetBottom: number;
  deviceType: 'phone' | 'tablet' | 'desktop';
  hasNotch: boolean;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    pixelRatio: 1,
    isTouch: false,
    isMobile: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    safeAreaInsetTop: 0,
    safeAreaInsetBottom: 0,
    deviceType: 'desktop',
    hasNotch: false
  });

  useEffect(() => {
    const calculateDeviceInfo = (): DeviceInfo => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Feature detection for touch capability (interaction mode), not layout
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // STRICT LAYOUT RULE: Treat max-width 768px as mobile
      // This aligns with standard tablet portrait/large phone breakpoints
      const isMobile = width <= 768;
      
      // Device type classification based purely on viewport width
      let deviceType: 'phone' | 'tablet' | 'desktop' = 'desktop';
      if (width <= 768) {
        deviceType = 'phone';
      } else if (width <= 1024) {
        deviceType = 'tablet';
      }
      
      // Safe area detection (relies on CSS environment variables injected by the browser)
      const safeAreaInsetTop = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--sat')
          .replace('px', '') || '0'
      );
      
      const safeAreaInsetBottom = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--sab')
          .replace('px', '') || '0'
      );
      
      // Detect notch based purely on safe area insets, no User Agent sniffing
      const hasNotch = safeAreaInsetTop > 20;

      return {
        pixelRatio,
        isTouch,
        isMobile,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        safeAreaInsetTop,
        safeAreaInsetBottom,
        deviceType,
        hasNotch
      };
    };

    const updateDeviceInfo = () => {
      setDeviceInfo(calculateDeviceInfo());
    };

    // Initial calculation
    updateDeviceInfo();

    // Listeners
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    // Check for safe area changes (e.g. rotating a notched phone)
    const observer = new ResizeObserver(updateDeviceInfo);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      observer.disconnect();
    };
  }, []);

  return deviceInfo;
};

// Optional: Device badge component for debugging
export const DeviceBadge: React.FC = () => {
  const device = useDeviceDetection();
  
  return (
    <div className="fixed bottom-2 right-2 z-50 bg-black/80 border border-brandCharcoal/20 p-2 rounded-md text-xs font-mono opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${device.isMobile ? 'bg-brandRed' : 'bg-green-500'}`} />
        <span className="text-[10px] uppercase tracking-wider text-brandNeutral">
          {device.deviceType} • {device.screenWidth}px
        </span>
      </div>
      {device.hasNotch && (
        <div className="text-[8px] text-brandYellow mt-1">SAFE_AREA_ACTIVE</div>
      )}
    </div>
  );
};