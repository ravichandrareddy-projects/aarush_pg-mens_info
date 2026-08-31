import { useEffect, useState } from 'react';

/**
 * Hook providing casual copy & inspect deterrents:
 * - Prevents F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U shortcuts
 * - Intercepts contextmenu right-click on ALL elements including QR scanner & forms
 * - Displays 🖕 Access Denied warning overlay and native warning alert
 */
export function useSecurityDeterrents(isAdminAuthenticated: boolean) {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [showDeniedToast, setShowDeniedToast] = useState(false);

  const triggerAccessDenied = () => {
    setShowDeniedToast(true);
    // Instant native warning alert fallback so no right-click goes unnoticed
    try {
      alert('🖕 ACCESS DENIED!\n\nDeveloper Tools & Code Inspect are permanently disabled for Resident Privacy.');
    } catch {
      // Ignore alert block
    }
    setTimeout(() => {
      setShowDeniedToast(false);
    }, 3500);
  };

  useEffect(() => {
    // 1. Keyboard Shortcut Interception (F12, Inspect, Source view)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerAccessDenied();
        return;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        triggerAccessDenied();
        return;
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        triggerAccessDenied();
        return;
      }
    };

    // 2. Universal Right-click contextmenu interception for all screens & QR scanner
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerAccessDenied();
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

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  return { isDevToolsOpen, showDeniedToast };
}
