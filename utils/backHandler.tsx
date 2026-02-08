import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';

export const useDoublePressBackExit = (onExit?: () => void) => {
  const exitCountRef = useRef(0);
  const backPressTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backAction = () => {
      if (exitCountRef.current === 0) {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        exitCountRef.current = 1;

        if (backPressTimeoutRef.current) {
          clearTimeout(backPressTimeoutRef.current);
        }
        
        backPressTimeoutRef.current = setTimeout(() => {
          exitCountRef.current = 0;
        }, 2000);
      } else {
        if (backPressTimeoutRef.current) {
          clearTimeout(backPressTimeoutRef.current);
          backPressTimeoutRef.current = null;
        }
        exitCountRef.current = 0;
        BackHandler.exitApp();
        if (onExit) onExit();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      if (backPressTimeoutRef.current) {
        clearTimeout(backPressTimeoutRef.current);
      }
      backHandler.remove();
    };
  }, [onExit]);
};