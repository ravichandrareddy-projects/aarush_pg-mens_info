import { useEffect, useState } from 'react';

/**
 * Hook providing casual copy & inspect deterrents:
 * - Prevents F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U shortcuts
 * - Disables contextmenu right-click on sensitive UI elements
 * - Detects active DevTools and blurs sensitive resident cards if unauthenticated
 */
export function useSecurityDeterrents(isAdminAuthenticated: boolean) {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // 1. Keyboard Shortcut Interception (F12, Inspect, Source view)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow normal typing inside input fields and textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return;
      }
    };

    // 2. Right-click contextmenu interception
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow input field right-click if needed, block contextmenu on sensitive card areas
      if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // 3. Lightweight DevTools Detection (Window threshold monitoring)
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 180 || heightDiff > 180) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  return { isDevToolsOpen };
}
