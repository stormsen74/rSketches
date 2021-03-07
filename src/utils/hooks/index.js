import { useEffect, useState } from 'react';

export function useHideTweaks(hide = false) {
  useEffect(() => {
    const _tweakpane = document.getElementsByClassName('tp-dfwv')[0];
    if (_tweakpane) {
      _tweakpane.style.visibility = 'visible';
      if (hide) _tweakpane.style.visibility = 'hidden';
    }
    return () => {
      if (_tweakpane) _tweakpane.style.visibility = 'hidden';
    };
  }, []);
}

export function useKeyPress(target) {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = ({ key }) => (key === target ? setKeyPressed(true) : null);
  const upHandler = ({ key }) => (key === target ? setKeyPressed(false) : null);

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return keyPressed;
}
