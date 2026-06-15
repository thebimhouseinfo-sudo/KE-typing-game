import React from 'react';
import { KeyboardKey } from '../types';
import { KEYBOARD_KEYS, FINGER_COLORS } from '../data';

interface KeyboardProps {
  targetKey: string | null;     // Key the child needs to press
  pressedKey: string | null;    // Key the child is currently pressing
}

export default function Keyboard({ targetKey, pressedKey }: KeyboardProps) {
  // Group keys into rows
  const numberRow = KEYBOARD_KEYS.filter((k) => k.row === 'number');
  const topRow = KEYBOARD_KEYS.filter((k) => k.row === 'top');
  const homeRow = KEYBOARD_KEYS.filter((k) => k.row === 'home');
  const bottomRow = KEYBOARD_KEYS.filter((k) => k.row === 'bottom');
  const spaceRow = KEYBOARD_KEYS.filter((k) => k.row === 'space');

  // helper to check match
  const isTarget = (key: KeyboardKey) => {
    if (!targetKey) return false;
    const cleanTarget = targetKey.toLowerCase();
    const cleanKey = key.key.toLowerCase();
    
    // special characters matching
    if (cleanTarget === ' ' && cleanKey === 'space') return true;
    if (cleanTarget === ';' && cleanKey === ';') return true;
    if (cleanTarget === '\'' && cleanKey === '\'') return true;
    if (cleanTarget === ',' && cleanKey === ',') return true;
    if (cleanTarget === '.' && cleanKey === '.') return true;
    if (cleanTarget === '/' && cleanKey === '/') return true;
    return cleanKey === cleanTarget;
  };

  const isPressed = (key: KeyboardKey) => {
    if (!pressedKey) return false;
    const cleanPressed = pressedKey.toLowerCase();
    const cleanKey = key.key.toLowerCase();
    
    if (cleanPressed === ' ' && cleanKey === 'space') return true;
    return cleanKey === cleanPressed;
  };

  const renderKey = (key: KeyboardKey) => {
    const fingerColor = FINGER_COLORS[key.finger] || FINGER_COLORS['thumb'];
    const activeTarget = isTarget(key);
    const activePressed = isPressed(key);

    // Dynamic width for special buttons
    let widthClass = 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12';
    if (key.key === 'tab') widthClass = 'w-12 sm:w-14';
    else if (key.key === 'backspace') widthClass = 'w-14 sm:w-16';
    else if (key.key === 'capslock') widthClass = 'w-14 sm:w-16';
    else if (key.key === 'enter') widthClass = 'w-18 sm:w-20';
    else if (key.key === 'shift-left') widthClass = 'w-16 sm:w-20';
    else if (key.key === 'shift-right') widthClass = 'w-16 sm:w-20';
    else if (key.key === 'space') widthClass = 'w-64 sm:w-80 h-11 sm:h-12';

    return (
      <div
        id={`key-btn-${key.key}`}
        key={key.key}
        className={`flex items-center justify-center rounded-xl font-mono text-xs sm:text-sm font-bold border-2 select-none shadow-sm transition-all duration-100 ${widthClass} ${
          activePressed
            ? 'bg-slate-800 text-white border-slate-900 translate-y-1 shadow-inner'
            : activeTarget
            ? 'bg-yellow-300 text-slate-900 border-yellow-500 scale-105 ring-4 ring-yellow-200 animate-pulse'
            : `${fingerColor.bg} ${fingerColor.border} ${fingerColor.text}`
        }`}
      >
        {key.display}
      </div>
    );
  };

  return (
    <div id="virtual-keyboard" className="bg-slate-100 dark:bg-slate-900 p-4 rounded-3xl border-4 border-slate-300 dark:border-slate-800 shadow-lg space-y-1.5 w-full max-w-4xl mx-auto overflow-x-auto">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 min-w-[500px]">
        {numberRow.map(renderKey)}
      </div>
      {/* Row 2 */}
      <div className="flex justify-center gap-1 min-w-[500px]">
        {topRow.map(renderKey)}
      </div>
      {/* Row 3 */}
      <div className="flex justify-center gap-1 min-w-[500px]">
        {homeRow.map(renderKey)}
      </div>
      {/* Row 4 */}
      <div className="flex justify-center gap-1 min-w-[500px]">
        {bottomRow.map(renderKey)}
      </div>
      {/* Row 5 */}
      <div className="flex justify-center gap-1 min-w-[500px]">
        {spaceRow.map(renderKey)}
      </div>

      <div className="text-center pt-2 text-[10px] sm:text-xs text-slate-400 font-medium">
        ⭐ Phím có màu giống nhau nghĩa là gõ bằng cùng một ngón tay đó bé ơi!
      </div>
    </div>
  );
}
