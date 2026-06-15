import { useEffect, useState } from 'react';

export const useFullScreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) { // Safari
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) { // IE11
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.warn('Fullscreen API not supported or user denied:', error);
      // Fallback: Vẫn cho phép chơi game bình thường nếu fullscreen thất bại
      setIsFullscreen(true); 
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.warn('Error exiting fullscreen:', error);
    }
  };

  return { isFullscreen, enterFullscreen, exitFullscreen };
};
