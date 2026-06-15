import React, { useState, useEffect, useRef } from 'react';
import { Level, UserProfile } from '../types';
import { KEYBOARD_KEYS } from '../data';
import { playSound } from '../utils/audio';
import { useFullScreen } from '../hooks/useFullScreen';
import Keyboard from './Keyboard';
import HandsVisualizer from './HandsVisualizer';
import { Sparkles, Trophy, ArrowLeft, RotateCcw, Volume2, Heart, Award, Star, Zap, Maximize2 } from 'lucide-react';
import typingBanner from '../assets/images/typing_banner_1780053365877.png';

interface GameAreaProps {
  level: Level;
  profile: UserProfile;
  onFinish: (stars: number, score: number, wpm: number, accuracy: number) => void;
  onBack: () => void;
  onUpdateInputMethod?: (method: 'telex' | 'vni') => void;
}

interface Bubble {
  id: string;
  word: string;
  x: number; // percentage width (5% to 85%)
  y: number; // position from bottom in px (0 to 380)
  speed: number; // pixels per frame/interval
  color: string;
  size: number;
}

// Map characters to their keyboard fingers
function getFingerForKey(char: string): string | null {
  if (!char) return null;
  const cleanChar = char.toLowerCase();
  
  let searchKey = cleanChar;
  if (cleanChar === ' ') searchKey = 'space';
  
  const found = KEYBOARD_KEYS.find((k) => k.key.toLowerCase() === searchKey);
  return found ? found.finger : null;
}

const FINGER_NAMES: Record<string, string> = {
  'left-pinky': 'Ngón Út Tay Trái 🔴',
  'left-ring': 'Ngón Áp Út Tay Trái 🟢',
  'left-middle': 'Ngón Giữa Tay Trái 🔵',
  'left-index': 'Ngón Trỏ Tay Trái 🟡',
  'thumb': 'Ngón Cái 👍',
  'right-index': 'Ngón Trỏ Tay Phải 🟡',
  'right-middle': 'Ngón Giữa Tay Phải 🔵',
  'right-ring': 'Ngón Áp Út Tay Phải 🟢',
  'right-pinky': 'Ngón Út Tay Phải 🔴',
};

const getFingerLabel = (char: string) => {
  const clean = char.toLowerCase();
  if (clean === ' ') {
    return { name: 'Ngón Cái 👍', side: 'Cả Hai Tay', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-400', isHomeKey: false };
  }
  const item = KEYBOARD_KEYS.find(k => k.key.toLowerCase() === clean);
  if (!item) {
    return { name: 'Phím Thường ⌨️', side: 'Bàn Phím', colorClass: 'bg-slate-100 text-slate-700 border-slate-300', isHomeKey: false };
  }
  
  const labelMap: Record<string, string> = {
    'left-pinky': 'Ngón Út Tay Trái 🔴',
    'left-ring': 'Ngón Áp Út Tay Trái 🟢',
    'left-middle': 'Ngón Giữa Tay Trái 🔵',
    'left-[#FFEAA7]': 'Ngón Giữa Tay Trái 🔵',
    'left-index': 'Ngón Trỏ Tay Trái 🟡',
    'thumb': 'Ngón Cái 👍',
    'right-index': 'Ngón Trỏ Tay Phải 🟡',
    'right-middle': 'Ngón Giữa Tay Phải 🔵',
    'right-ring': 'Ngón Áp Út Tay Phải 🟢',
    'right-pinky': 'Ngón Út Tay Phải 🔴'
  };
  
  const colorMap: Record<string, string> = {
    'left-pinky': 'bg-rose-100 text-rose-700 border-rose-400',
    'left-ring': 'bg-pink-100 text-pink-700 border-pink-400',
    'left-middle': 'bg-amber-100 text-amber-500 border-amber-400',
    'left-index': 'bg-[#FFEAA7]/40 text-yellow-600 border-yellow-400',
    'thumb': 'bg-emerald-100 text-emerald-700 border-emerald-400',
    'right-index': 'bg-sky-100 text-sky-700 border-sky-400',
    'right-middle': 'bg-blue-100 text-blue-700 border-blue-400',
    'right-ring': 'bg-indigo-100 text-indigo-700 border-indigo-400',
    'right-pinky': 'bg-violet-100 text-violet-700 border-violet-400'
  };

  const isHome = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'].includes(clean);
  const side = item.finger.startsWith('left') ? 'Tay Trái' : item.finger.startsWith('right') ? 'Tay Phải' : 'Hai Tay';

  return {
    name: labelMap[item.finger] || item.finger,
    side,
    colorClass: colorMap[item.finger] || 'bg-slate-100 text-slate-700 border-slate-300',
    isHomeKey: isHome
  };
};

const viReplacementMap: { [key: string]: string[] } = {
  'đ': ['dd', 'd9', 'd'],
  'â': ['aa', 'a6', 'a'],
  'ă': ['aw', 'a8', 'a'],
  'ê': ['ee', 'e6', 'e'],
  'ô': ['oo', 'o6', 'o'],
  'ơ': ['ow', 'o7', 'o'],
  'ư': ['uw', 'u7', 'w', 'u'],
  'á': ['as', 'a1', 'a'],
  'à': ['af', 'a2', 'a'],
  'ả': ['ar', 'a3', 'a'],
  'ã': ['ax', 'a4', 'a'],
  'ạ': ['aj', 'a5', 'a'],
  'ấ': ['aas', 'aa1', 'a61', 'aa', 'a'],
  'ầ': ['aaf', 'aa2', 'a62', 'aa', 'a'],
  'ẩ': ['aar', 'aa3', 'a63', 'aa', 'a'],
  'ẫ': ['aax', 'aa4', 'a64', 'aa', 'a'],
  'ậ': ['aaj', 'aa5', 'a65', 'aa', 'a'],
  'ắ': ['aws', 'aw1', 'a81', 'aw', 'a'],
  'ằ': ['awf', 'aw2', 'a82', 'aw', 'a'],
  'ẳ': ['awr', 'aw3', 'a83', 'aw', 'a'],
  'ẵ': ['awx', 'aw4', 'a84', 'aw', 'a'],
  'ặ': ['awj', 'aw5', 'a85', 'aw', 'a'],
  'ế': ['ees', 'ee1', 'e61', 'ee', 'e'],
  'ề': ['eef', 'ee2', 'e62', 'ee', 'e'],
  'ể': ['eer', 'ee3', 'e63', 'ee', 'e'],
  'ễ': ['eex', 'ee4', 'e64', 'ee', 'e'],
  'ệ': ['eej', 'ee5', 'e65', 'ee', 'e'],
  'ố': ['oos', 'oo1', 'o61', 'oo', 'o'],
  'ồ': ['oof', 'oo2', 'o62', 'oo', 'o'],
  'ổ': ['oor', 'oo3', 'o63', 'oo', 'o'],
  'ỗ': ['oox', 'oo4', 'o64', 'oo', 'o'],
  'ộ': ['ooj', 'oo5', 'o65', 'oo', 'o'],
  'ớ': ['ows', 'ow1', 'o71', 'ow', 'o'],
  'ờ': ['owf', 'ow2', 'o72', 'ow', 'o'],
  'ở': ['owr', 'ow3', 'o73', 'ow', 'o'],
  'ỡ': ['owx', 'ow4', 'o74', 'ow', 'o'],
  'ợ': ['owj', 'ow5', 'o75', 'ow', 'o'],
  'ứ': ['uws', 'uw1', 'u71', 'uw', 'u'],
  'ừ': ['uwf', 'uw2', 'u72', 'uw', 'u'],
  'ử': ['uwr', 'uw3', 'u73', 'uw', 'u'],
  'ữ': ['uwx', 'uw4', 'u74', 'uw', 'u'],
  'ự': ['uwj', 'uw5', 'u75', 'uw', 'u'],
  'é': ['es', 'e1', 'e'],
  'è': ['ef', 'e2', 'e'],
  'ẻ': ['er', 'e3', 'e'],
  'ẽ': ['ex', 'e4', 'e'],
  'ẹ': ['ej', 'e5', 'e'],
  'í': ['is', 'i1', 'i'],
  'ì': ['if', 'i2', 'i'],
  'ỉ': ['ir', 'i3', 'i'],
  'ĩ': ['ix', 'i4', 'i'],
  'ị': ['ij', 'i5', 'i'],
  'ó': ['os', 'o1', 'o'],
  'ò': ['of', 'o2', 'o'],
  'ỏ': ['or', 'o3', 'o'],
  'õ': ['ox', 'o4', 'o'],
  'ọ': ['oj', 'o5', 'o'],
  'ú': ['us', 'u1', 'u'],
  'ù': ['uf', 'u2', 'u'],
  'ủ': ['ur', 'u3', 'u'],
  'ũ': ['ux', 'u4', 'u'],
  'ụ': ['uj', 'u5', 'u'],
  'ý': ['ys', 'y1', 'y'],
  'ỳ': ['yf', 'y2', 'y'],
  'ỷ': ['yr', 'y3', 'y'],
  'ỹ': ['yx', 'y4', 'y'],
  'Ỵ': ['yj', 'y5', 'Y'],
  'Đ': ['DD', 'D9', 'D'],
  'Â': ['AA', 'A6', 'A'],
  'Ă': ['AW', 'A8', 'A'],
  'Ê': ['EE', 'E6', 'E'],
  'Ô': ['OO', 'O6', 'O'],
  'Ơ': ['OW', 'O7', 'O'],
  'Ư': ['UW', 'U7', 'W', 'U'],
  'Á': ['AS', 'A1', 'A'],
  'À': ['AF', 'A2', 'A'],
  'Ả': ['AR', 'A3', 'A'],
  'Ã': ['AX', 'A4', 'A'],
  'Ạ': ['AJ', 'A5', 'A'],
  'Ấ': ['AAS', 'AA1', 'A61', 'AA', 'A'],
  'Ầ': ['AAF', 'AA2', 'A62', 'AA', 'A'],
  'Ẩ': ['AAR', 'AA3', 'A63', 'AA', 'A'],
  'Ẫ': ['AAX', 'AA4', 'A64', 'AA', 'A'],
  'Ậ': ['AAJ', 'AA5', 'A65', 'AA', 'A'],
  'Ắ': ['AWS', 'AW1', 'A81', 'AW', 'A'],
  'Ằ': ['AWF', 'AW2', 'A82', 'AW', 'A'],
  'Ẳ': ['AWR', 'AW3', 'A83', 'AW', 'A'],
  'Ẵ': ['AWX', 'AW4', 'A84', 'AW', 'A'],
  'Ặ': ['AWJ', 'AW5', 'A85', 'AW', 'A'],
  'Ế': ['EES', 'EE1', 'E61', 'EE', 'E'],
  'Ề': ['EEF', 'EE2', 'E62', 'EE', 'E'],
  'Ể': ['EER', 'EE3', 'E63', 'EE', 'E'],
  'Ễ': ['EEX', 'EE4', 'E64', 'EE', 'E'],
  'Ệ': ['EEJ', 'EE5', 'E65', 'EE', 'E'],
  'Ố': ['OOS', 'OO1', 'O61', 'OO', 'O'],
  'Ồ': ['OOF', 'OO2', 'O62', 'OO', 'O'],
  'Ổ': ['OOR', 'OO3', 'O63', 'OO', 'O'],
  'Ỗ': ['OOX', 'OO4', 'O64', 'OO', 'O'],
  'Ộ': ['OOJ', 'OO5', 'O65', 'OO', 'O'],
  'Ớ': ['OWS', 'OW1', 'O71', 'OW', 'O'],
  'Ờ': ['OWF', 'OW2', 'O72', 'OW', 'O'],
  'Ở': ['OWR', 'OW3', 'O73', 'OW', 'O'],
  'Ỡ': ['OWX', 'OW4', 'O74', 'OW', 'O'],
  'Ợ': ['OWJ', 'OW5', 'O75', 'OW', 'O'],
  'Ứ': ['UWS', 'UW1', 'U71', 'UW', 'U'],
  'Ừ': ['UWF', 'UW2', 'U72', 'UW', 'U'],
  'Ử': ['UWR', 'UW3', 'U73', 'UW', 'U'],
  'Ữ': ['UWX', 'UW4', 'U74', 'UW', 'U'],
  'Ự': ['UWJ', 'UW5', 'U75', 'UW', 'U'],
  'É': ['ES', 'E1', 'E'],
  'È': ['EF', 'E2', 'E'],
  'Ẻ': ['ER', 'E3', 'E'],
  'Ẽ': ['EX', 'E4', 'E'],
  'Ẹ': ['EJ', 'E5', 'E'],
  'Í': ['IS', 'I1', 'I'],
  'Ì': ['IF', 'I2', 'I'],
  'Ỉ': ['IR', 'I3', 'I'],
  'Ĩ': ['IX', 'I4', 'I'],
  'Ị': ['IJ', 'I5', 'I'],
  'Ó': ['OS', 'O1', 'O'],
  'Ò': ['OF', 'O2', 'O'],
  'Ỏ': ['OR', 'O3', 'O'],
  'Õ': ['OX', 'O4', 'O'],
  'Ọ': ['OJ', 'O5', 'O'],
  'Ú': ['US', 'u1', 'U'],
  'Ù': ['UF', 'U2', 'U'],
  'Ủ': ['UR', 'U3', 'U'],
  'Ũ': ['UX', 'U4', 'U'],
  'Ụ': ['UJ', 'U5', 'U'],
  'Ý': ['YS', 'Y1', 'Y'],
  'Ỳ': ['YF', 'Y2', 'Y'],
  'Ỷ': ['YR', 'Y3', 'Y'],
  'Ỹ': ['YX', 'Y4', 'Y']
};

const isEnglishTarget = (str: string): boolean => {
  return !/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(str);
};

const normalizeInputByTarget = (val: string, targetClean: string): string => {
  if (!targetClean || !isEnglishTarget(targetClean)) {
    return val;
  }
  let converted = '';
  for (let i = 0; i < val.length; i++) {
    const char = val[i];
    if (viReplacementMap[char]) {
      let found = false;
      const remainingTarget = targetClean.slice(converted.length);
      for (const replacement of viReplacementMap[char]) {
        if (remainingTarget.startsWith(replacement)) {
          converted += replacement;
          found = true;
          break;
        }
      }
      if (!found) {
        // Fallback to the plain base letter (last element)
        const fallback = viReplacementMap[char][viReplacementMap[char].length - 1];
        converted += fallback;
      }
    } else {
      converted += char;
    }
  }
  return converted;
};

function getBaseEnglishLetter(char: string): string {
  const normMap: Record<string, string> = {
    'đ': 'd', 'Đ': 'D',
    'ă': 'a', 'â': 'a', 'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'Ă': 'A', 'Â': 'A', 'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
  };
  return normMap[char] || char;
}

function getDiacriticsOfChar(char: string): string[] {
  const charLower = char.toLowerCase();
  const diacritics: string[] = [];
  
  if (['â', 'ê', 'ô', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'].includes(charLower)) {
    diacritics.push('circumflex');
  }
  if (['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'].includes(charLower)) {
    diacritics.push('breve');
  }
  if (['ơ', 'ư', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ứ', 'ừ', 'ử', 'ữ', 'ự'].includes(charLower)) {
    diacritics.push('horn');
  }
  if (['đ'].includes(charLower)) {
    diacritics.push('crossed');
  }
  
  // Tones
  if (['á', 'ấ', 'ắ', 'é', 'ế', 'í', 'ó', 'ố', 'ớ', 'ú', 'ứ', 'ý'].includes(charLower)) {
    diacritics.push('acute');
  }
  if (['à', 'ầ', 'ằ', 'è', 'ề', 'ì', 'ò', 'ồ', 'ờ', 'ù', 'ừ', 'ỳ'].includes(charLower)) {
    diacritics.push('grave');
  }
  if (['ả', 'ẩ', 'ẳ', 'ẻ', 'ể', 'ỉ', 'ỏ', 'ổ', 'ở', 'ủ', 'ử', 'ỷ'].includes(charLower)) {
    diacritics.push('hook');
  }
  if (['ã', 'ẫ', 'ẵ', 'ẽ', 'ễ', 'ĩ', 'õ', 'ỗ', 'ỡ', 'ũ', 'ữ', 'ỹ'].includes(charLower)) {
    diacritics.push('tilde');
  }
  if (['ạ', 'ậ', 'ặ', 'ẹ', 'ệ', 'ị', 'ọ', 'ộ', 'ợ', 'ụ', 'ự', 'ỵ'].includes(charLower)) {
    diacritics.push('dot');
  }
  
  return diacritics;
}

function isValidIntermediateVowel(inputChar: string, targetChar: string): boolean {
  if (inputChar.toLowerCase() === targetChar.toLowerCase()) return true;
  if (getBaseEnglishLetter(inputChar).toLowerCase() !== getBaseEnglishLetter(targetChar).toLowerCase()) return false;
  
  const inputDis = getDiacriticsOfChar(inputChar);
  const targetDis = getDiacriticsOfChar(targetChar);
  
  // Every diacritic in the input must also be present in the target
  return inputDis.every(diacritic => targetDis.includes(diacritic));
}

const vowelTones: Record<string, Record<string, string>> = {
  'a': { 'sắc': 'á', 'huyền': 'à', 'hỏi': 'ả', 'ngã': 'ã', 'nặng': 'ạ' },
  'ă': { 'sắc': 'ắ', 'huyền': 'ằ', 'hỏi': 'ẳ', 'ngã': 'ẵ', 'nặng': 'ặ' },
  'â': { 'sắc': 'ấ', 'huyền': 'ầ', 'hỏi': 'ẩ', 'ngã': 'ẫ', 'nặng': 'ậ' },
  'e': { 'sắc': 'é', 'huyền': 'è', 'hỏi': 'ẻ', 'ngã': 'ẽ', 'nặng': 'ẹ' },
  'ê': { 'sắc': 'ế', 'huyền': 'ề', 'hỏi': 'ể', 'ngã': 'ễ', 'nặng': 'ệ' },
  'i': { 'sắc': 'í', 'huyền': 'ì', 'hỏi': 'ỉ', 'ngã': 'ĩ', 'nặng': 'ị' },
  'o': { 'sắc': 'ó', 'huyền': 'ò', 'hỏi': 'ỏ', 'ngã': 'õ', 'nặng': 'ọ' },
  'ô': { 'sắc': 'ố', 'huyền': 'ồ', 'hỏi': 'ổ', 'ngã': 'ỗ', 'nặng': 'ộ' },
  'ơ': { 'sắc': 'ớ', 'huyền': 'ờ', 'hỏi': 'ở', 'ngã': 'ỡ', 'nặng': 'ợ' },
  'u': { 'sắc': 'ú', 'huyền': 'ù', 'hỏi': 'ủ', 'ngã': 'ũ', 'nặng': 'ụ' },
  'ư': { 'sắc': 'ứ', 'huyền': 'ừ', 'hỏi': 'ử', 'ngã': 'ữ', 'nặng': 'ự' },
  'y': { 'sắc': 'ý', 'huyền': 'ỳ', 'hỏi': 'ỷ', 'ngã': 'ỹ', 'nặng': 'ỵ' },
  'A': { 'sắc': 'Á', 'huyền': 'À', 'hỏi': 'Ả', 'ngã': 'Ã', 'nặng': 'Ạ' },
  'Ă': { 'sắc': 'Ắ', 'huyền': 'Ằ', 'hỏi': 'Ẳ', 'ngã': 'Ẵ', 'nặng': 'Ặ' },
  'Â': { 'sắc': 'Ấ', 'huyền': 'Ầ', 'hỏi': 'Ẩ', 'ngã': 'Ẫ', 'nặng': 'Ậ' },
  'E': { 'sắc': 'É', 'huyền': 'È', 'hỏi': 'Ẻ', 'ngã': 'Ẽ', 'nặng': 'Ẹ' },
  'Ê': { 'sắc': 'Ế', 'huyền': 'Ề', 'hỏi': 'Ể', 'ngã': 'Ễ', 'nặng': 'Ệ' },
  'I': { 'sắc': 'Í', 'huyền': 'Ì', 'hỏi': 'Ỉ', 'ngã': 'Ĩ', 'nặng': 'Ị' },
  'O': { 'sắc': 'Ó', 'huyền': 'Ò', 'hỏi': 'Ỏ', 'ngã': 'Õ', 'nặng': 'Ọ' },
  'Ô': { 'sắc': 'Ố', 'huyền': 'Ồ', 'hỏi': 'Ổ', 'ngã': 'Ỗ', 'nặng': 'Ộ' },
  'Ơ': { 'sắc': 'Ớ', 'huyền': 'Ờ', 'hỏi': 'Ở', 'ngã': 'Ỡ', 'nặng': 'Ợ' },
  'U': { 'sắc': 'Ú', 'huyền': 'Ù', 'hỏi': 'Ủ', 'ngã': 'Ũ', 'nặng': 'Ụ' },
  'Ư': { 'sắc': 'Ứ', 'huyền': 'Ừ', 'hỏi': 'Ử', 'ngã': 'Ữ', 'nặng': 'Ự' },
  'Y': { 'sắc': 'Ý', 'huyền': 'Ỳ', 'hỏi': 'Ỷ', 'ngã': 'Ỹ', 'nặng': 'Ỵ' }
};

function applyToneToWord(word: string, tone: string): string {
  const vowels = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
                  'A', 'Ă', 'Â', 'E', 'Ê', 'I', 'O', 'Ô', 'Ơ', 'U', 'Ư', 'Y'];
  
  const indices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (vowels.includes(word[i])) {
      indices.push(i);
    }
  }

  if (indices.length === 0) return word;

  let targetIdx = indices[0];

  if (indices.length === 2) {
    const pair = (word[indices[0]] + word[indices[1]]).toLowerCase();
    if (['oa', 'oe', 'uy', 'ua', 'uô', 'uo', 'iê', 'yê', 'ươ', 'oă', 'uâ', 'uơ'].includes(pair)) {
      targetIdx = indices[1];
    } else {
      targetIdx = indices[0];
    }
  } else if (indices.length === 3) {
    const b0 = getBaseEnglishLetter(word[indices[0]]).toLowerCase();
    const b1 = getBaseEnglishLetter(word[indices[1]]).toLowerCase();
    const b2 = getBaseEnglishLetter(word[indices[2]]).toLowerCase();
    if (b0 === 'u' && b1 === 'y' && b2 === 'e') {
      targetIdx = indices[2];
    } else {
      targetIdx = indices[1];
    }
  }

  const targetChar = word[targetIdx];
  if (vowelTones[targetChar] && vowelTones[targetChar][tone]) {
    const chars = word.split('');
    chars[targetIdx] = vowelTones[targetChar][tone];
    return chars.join('');
  }

  return word;
}

function convertWordToVietnamese(word: string, method?: 'telex' | 'vni'): string {
  if (!word) return '';
  const currentMethod = method || 'telex';

  // Extract leading non-alphabetic/numeric characters
  const leadingMatch = word.match(/^[^A-Za-z0-9àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]+/);
  const leading = leadingMatch ? leadingMatch[0] : '';
  
  // Extract trailing non-alphabetic/numeric characters
  const trailingMatch = word.match(/[^A-Za-z0-9àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]+$/);
  const trailing = trailingMatch ? trailingMatch[0] : '';
  
  // Get the core word to convert
  const coreWord = word.slice(leading.length, word.length - trailing.length);
  
  if (!coreWord) return word;

  let result = coreWord;

  if (currentMethod === 'telex') {
    result = result.replace(/dd/g, 'đ').replace(/DD/g, 'Đ').replace(/dD/g, 'đ').replace(/Dd/g, 'đ');
    result = result.replace(/aa/g, 'â').replace(/AA/g, 'Â').replace(/Aa/g, 'â').replace(/aA/g, 'â');
    result = result.replace(/ee/g, 'ê').replace(/EE/g, 'Ê').replace(/Ee/g, 'ê').replace(/eE/g, 'ê');
    result = result.replace(/oo/g, 'ô').replace(/OO/g, 'Ô').replace(/Oo/g, 'ô').replace(/oO/g, 'ô');
    result = result.replace(/aw/g, 'ă').replace(/AW/g, 'Ă').replace(/Aw/g, 'ă').replace(/aW/g, 'ă');
    result = result.replace(/ow/g, 'ơ').replace(/OW/g, 'Ơ').replace(/Ow/g, 'ơ').replace(/oW/g, 'ơ');
    result = result.replace(/uw/g, 'ư').replace(/UW/g, 'Ư').replace(/Uw/g, 'ư').replace(/uW/g, 'ư');

    if (result.toLowerCase() === 'w') {
      result = result === 'W' ? 'Ư' : 'ư';
    } else {
      result = result.replace(/([bcdfghklmnpqrstvx])w/gi, (match, p1) => {
        const isUpper = p1 === p1.toUpperCase();
        return p1 + (isUpper ? 'Ư' : 'ư');
      });
    }

    const lastChar = result.slice(-1).toLowerCase();
    if (['s', 'f', 'r', 'x', 'j'].includes(lastChar)) {
      const toneMap: Record<string, string> = { s: 'sắc', f: 'huyền', r: 'hỏi', x: 'ngã', j: 'nặng' };
      const tone = toneMap[lastChar];
      const stem = result.slice(0, -1);
      const updatedStem = applyToneToWord(stem, tone);
      if (updatedStem !== stem) {
        result = updatedStem;
      }
    }
  } else {
    result = result.replace(/d9/g, 'đ').replace(/D9/g, 'Đ');
    result = result.replace(/a6/g, 'â').replace(/A6/g, 'Â');
    result = result.replace(/e6/g, 'ê').replace(/E6/g, 'Ê');
    result = result.replace(/o6/g, 'ô').replace(/O6/g, 'Ô');
    result = result.replace(/a8/g, 'ă').replace(/A8/g, 'Ă');
    result = result.replace(/o7/g, 'ơ').replace(/O7/g, 'Ơ');
    result = result.replace(/u7/g, 'ư').replace(/U7/g, 'Ư');

    const lastChar = result.slice(-1);
    if (['1', '2', '3', '4', '5'].includes(lastChar)) {
      const toneMap: Record<string, string> = { '1': 'sắc', '2': 'huyền', '3': 'hỏi', '4': 'ngã', '5': 'nặng' };
      const tone = toneMap[lastChar];
      const stem = result.slice(0, -1);
      const updatedStem = applyToneToWord(stem, tone);
      if (updatedStem !== stem) {
        result = updatedStem;
      }
    }
  }

  return leading + result + trailing;
}

function isVietnamesePrefixMatch(inputVal: string, targetStr: string, method?: 'telex' | 'vni'): boolean {
  const currentMethod = method || 'telex';
  const convertedWords = inputVal.split(' ').map(w => convertWordToVietnamese(w, currentMethod)).join(' ');
  if (targetStr.toLowerCase().startsWith(convertedWords.toLowerCase())) {
    return true;
  }

  let mismatchIdx = 0;
  while (mismatchIdx < convertedWords.length && mismatchIdx < targetStr.length && convertedWords[mismatchIdx].toLowerCase() === targetStr[mismatchIdx].toLowerCase()) {
    mismatchIdx++;
  }

  if (mismatchIdx < convertedWords.length && mismatchIdx < targetStr.length) {
    const inputChar = convertedWords[mismatchIdx];
    const targetChar = targetStr[mismatchIdx];
    if (isValidIntermediateVowel(inputChar, targetChar)) {
      const remainingInput = convertedWords.slice(mismatchIdx + 1);
      const remainingTarget = targetStr.slice(mismatchIdx + 1);
      if (remainingTarget.toLowerCase().startsWith(remainingInput.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
}

function getNextKeyForVietnamese(inputChar: string, targetChar: string, method?: 'telex' | 'vni'): string {
  const currentMethod = method || 'telex';
  const inputDis = getDiacriticsOfChar(inputChar);
  const targetDis = getDiacriticsOfChar(targetChar);
  const missingDis = targetDis.filter(d => !inputDis.includes(d));
  
  if (missingDis.length === 0) {
    if (targetChar.toLowerCase() === 'đ' && inputChar.toLowerCase() === 'd') {
      return currentMethod === 'telex' ? 'd' : '9';
    }
    return '';
  }

  const firstMissing = missingDis[0];
  
  if (currentMethod === 'telex') {
    switch (firstMissing) {
      case 'circumflex':
        return getBaseEnglishLetter(targetChar).toLowerCase();
      case 'breve':
        return 'w';
      case 'horn':
        return 'w';
      case 'crossed':
        return 'd';
      case 'acute':
        return 's';
      case 'grave':
        return 'f';
      case 'hook':
        return 'r';
      case 'tilde':
        return 'x';
      case 'dot':
        return 'j';
    }
  } else {
    switch (firstMissing) {
      case 'circumflex':
        return '6';
      case 'breve':
        return '8';
      case 'horn':
        return '7';
      case 'crossed':
        return '9';
      case 'acute':
        return '1';
      case 'grave':
        return '2';
      case 'hook':
        return '3';
      case 'tilde':
        return '4';
      case 'dot':
        return '5';
    }
  }
  
  return '';
}

export default function GameArea({ level, profile, onFinish, onBack, onUpdateInputMethod }: GameAreaProps) {
  const { enterFullscreen, exitFullscreen } = useFullScreen();
  const [isPlaying, setIsPlaying] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showHandOverlay, setShowHandOverlay] = useState(false);
  
  // Auto-enter fullscreen when game starts
  useEffect(() => {
    enterFullscreen();
    return () => {
      exitFullscreen();
    };
  }, []);

  // PostMessage communication with parent Blogger page for progress persistence
  useEffect(() => {
    // Request progress data from parent on mount
    window.parent.postMessage({ type: 'GET_PROGRESS' }, 'https://thebimhouseinfo-sudo.github.io');

    // Listen for progress response from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://thebimhouseinfo-sudo.github.io') return;

      const message = event.data;
      if (message.type === 'SEND_PROGRESS' && message.data) {
        // Progress data received from parent - can be used to restore game state if needed
        console.log('Received progress from Blogger:', message.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Game metrics
  const [typedValue, setTypedValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Stats on completion
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [stars, setStars] = useState(0);
  
  // Confetti / effects
  const [showConfetti, setShowConfetti] = useState(false);
  const [hitEffect, setHitEffect] = useState<string | null>(null); // 'correct' | 'wrong'
  const effectTimeout = useRef<NodeJS.Timeout | null>(null);

  // BUBBLE RACE SPECIFIC STATES
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [lives, setLives] = useState(5);
  const [activeBubbleWord, setActiveBubbleWord] = useState('');
  const bubbleIdCounter = useRef(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Level 9 custom text input state
  const [customTextInput, setCustomTextInput] = useState('');
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isTypingMode, setIsTypingMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Key tracking helper for the guides
  const [targetPhysKey, setTargetPhysKey] = useState<string | null>(' ');

  // Split text into sentences (ending with . ? ! or newline)
  const getSentences = (text: string): string[] => {
    return text.split(/(?<=[.!?])\s+|\n+/).filter(s => s.trim().length > 0);
  };

  // Get current raw items - For lvl-9, use sentences if in typing mode
  const targetItems = level.id === 'lvl-9' && isTypingMode && sentences.length > 0 
    ? sentences 
    : (level.id === 'lvl-9' && customTextInput.trim() ? [customTextInput.trim()] : level.targetItems);
  
  const currentItem = targetItems[currentIndex] || '';

  // Get spelling formula suggestion for Vietnam kids
  const currentFormula = level.helperTips && level.helperTips[currentItem];

  // Helper boolean to check if active level is a Vietnamese accent or phrase level
  const isVietnameseLevel = ['vietnamese', 'typing-challenge'].includes(level.category);
  const usesVietnameseKeyboard = ['vietnamese', 'typing-challenge'].includes(level.category);

  // Start initialization
  useEffect(() => {
    if (false) return;

    if (level.id === 'lvl-10') {
      // Spawn initial bubbles
      spawnBubble();
      spawnBubble();
      // Start bubble tick interval
      gameIntervalRef.current = setInterval(updateBubbles, 50);
      // Spawn new bubbles periodically
      bubbleSpawnTimerRef.current = setInterval(() => {
        if (bubbles.length < 5 && isPlaying && !showResults) {
          spawnBubble();
        }
      }, 4000);
    } else {
      // Regular mode
      updateKeyboardGuide('', currentItem);
    }

    // Auto focus the hidden input for typing capture
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (bubbleSpawnTimerRef.current) clearInterval(bubbleSpawnTimerRef.current);
    };
  }, [currentIndex, level.category, false]);

  const updateKeyboardGuide = (typed: string, target: string) => {
    if (!target) return;
    // Find first mismatched character (case-insensitive to support capitalization leniency)
    let matchIdx = 0;
    while (matchIdx < typed.length && matchIdx < target.length && typed[matchIdx].toLowerCase() === target[matchIdx].toLowerCase()) {
      matchIdx++;
    }

    if (matchIdx >= target.length) {
      setTargetPhysKey('space');
      return;
    }

    const nextChar = target[matchIdx].toLowerCase();

    if (isVietnameseLevel) {
      const inputChar = matchIdx < typed.length ? typed[matchIdx] : '';
      const targetChar = target[matchIdx];
      const nextPhysKey = getNextKeyForVietnamese(inputChar, targetChar, profile.inputMethod);
      if (nextPhysKey) {
        setTargetPhysKey(nextPhysKey);
        return;
      }
    }
    
    // Simplistic visual helper mapping
    const vnKeys: Record<string, string> = {
      'đ': 'd', 'ă': 'a', 'â': 'a', 'ê': 'e', 'ô': 'o', 'ơ': 'o', 'ư': 'u',
      'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
      'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
      'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
      'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
      'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
      'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    };

    setTargetPhysKey(vnKeys[nextChar] || nextChar);
  };

  // Spawn bubbles
  const spawnBubble = () => {
    // Only spawn if currently playing and results are not shown
    if (!isPlaying || showResults) return;

    setBubbles(prev => {
      // Limit to 5 bubbles on screen to prevent overcrowding
      if (prev.length >= 5) {
        return prev;
      }

      const list = level.targetItems;
      // Filter out words that are already active on screen to prevent duplicates
      const activeWords = prev.map(b => b.word.toLowerCase());
      const availableWords = list.filter(w => !activeWords.includes(w.toLowerCase()));
      const randomWord = availableWords.length > 0 
        ? availableWords[Math.floor(Math.random() * availableWords.length)]
        : list[Math.floor(Math.random() * list.length)];

      const id = `bubble-${bubbleIdCounter.current++}`;
      
      const colors = [
        'from-pink-400 to-rose-500 shadow-rose-300',
        'from-sky-400 to-blue-500 shadow-blue-300',
        'from-emerald-400 to-teal-500 shadow-teal-300',
        'from-purple-400 to-indigo-500 shadow-purple-300',
        'from-amber-400 to-orange-500 shadow-orange-300'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.max(100, Math.min(140, randomWord.length * 14 + 50));

      // Choose a beautiful X coordinate that maximizes horizontal distance with active bubbles 
      // of similar heights, to prevent bubbles from stacking or overlapping ("dính chùm")
      let bestX = 10 + Math.random() * 70;
      let maxMinDist = -1;
      
      for (let attempt = 0; attempt < 25; attempt++) {
        const candidateX = 10 + Math.random() * 70;
        let minDist = 100;
        for (const b of prev) {
          // If the bubble is nearby in Y-height, horizontal overlap is critical
          if (Math.abs(b.y - (-50)) < 150) {
            const dx = Math.abs(b.x - candidateX);
            if (dx < minDist) {
              minDist = dx;
            }
          }
        }
        
        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          bestX = candidateX;
        }
      }

      const newBubble: Bubble = {
        id,
        word: randomWord,
        x: bestX,
        y: -50, // start just below
        speed: 0.9 + Math.random() * 0.4, // more uniform speed to prevent faster bubbles from catching up
        color,
        size
      };

      return [...prev, newBubble];
    });
  };

  // Move bubbles up
  const updateBubbles = () => {
    setBubbles(prev => {
      const updated: Bubble[] = [];
      let livesDeducted = 0;

      for (let b of prev) {
        const nextY = b.y + b.speed;
        if (nextY > 370) {
          // Reached the top! Bubble pops sadly
          livesDeducted++;
          playSound('wrong');
          // Trigger floating sad popup
        } else {
          updated.push({ ...b, y: nextY });
        }
      }

      if (livesDeducted > 0) {
        setLives(current => {
          const nextLives = current - livesDeducted;
          if (nextLives <= 0) {
            handleGameOver();
          }
          return Math.max(0, nextLives);
        });
      }

      return updated;
    });
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    calculateGameScores(true);
  };

  // Key tracking to render active keyboard presses in real-time
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showHandOverlay || false) return;
    const key = e.key;
    if (key === 'Process' || key === 'Dead') return; // Ignore IME compositing keys directly
    setPressedKey(key);
    playSound('key-press');

    // Quick clear feature for Enter or Escape inside Bubble Race to help spelling flow
    if (level.id === 'lvl-10' && (key === 'Enter' || key === 'Escape')) {
      setTypedValue('');
      e.currentTarget.value = '';
    }
  };

  const handleKeyUp = () => {
    if (showHandOverlay || false) return;
    setPressedKey(null);
  };

  // Confetti activation helper
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Feedback effects for gõ phím
  const setFeedbackEffect = (type: 'correct' | 'wrong') => {
    if (effectTimeout.current) clearTimeout(effectTimeout.current);
    setHitEffect(type);
    effectTimeout.current = setTimeout(() => setHitEffect(null), 150);
  };

  // Handle standard typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showResults || !isPlaying || showHandOverlay || false) return;

    const rawInput = e.target.value;
    const isBubbleRace = level.id === 'lvl-10';
    const isLevel9TypingMode = level.id === 'lvl-9' && isTypingMode && sentences.length > 0;
    
    let targetClean = isBubbleRace ? '' : currentItem;

    if (!isBubbleRace && !isLevel9TypingMode && rawInput === ' ') {
      // Ignore single leading space to prevent double-space errors from advancing previous word
      e.target.value = '';
      return;
    }
    
    // Convert input base keys using Telex/VNI if it's a Vietnamese level/bubble race, otherwise normalize by target
    let val = rawInput;
    if (usesVietnameseKeyboard) {
      val = rawInput.split(' ').map(w => convertWordToVietnamese(w, profile.inputMethod)).join(' ');
    } else {
      val = normalizeInputByTarget(rawInput, targetClean);
    }
    e.target.value = val;
    
    // Start timing on first keypress
    if (startTime === null) {
      setStartTime(Date.now());
    }

    setKeystrokes(prev => prev + 1);

    // Level 9 Typing Mode - sentence by sentence
    if (isLevel9TypingMode) {
      setTypedValue(val);
      
      // Check if sentence is complete
      if (val === targetClean) {
        playSound('correct');
        triggerConfetti();
        setFeedbackEffect('correct');
        setScore(prev => prev + targetClean.length * 15);
        
        // Clear input
        setTypedValue('');
        e.target.value = '';
        
        // Move to next sentence or finish
        if (currentSentenceIndex < sentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
          setCurrentIndex(prev => prev + 1);
          setTimeout(() => {
            inputRef.current?.focus();
            updateKeyboardGuide('', sentences[currentSentenceIndex + 1]);
          }, 100);
        } else {
          // All sentences done!
          handleLevelComplete();
        }
        return;
      }
      
      // Check prefix match using Vietnamese-aware comparison
      const isCorrectSequence = usesVietnameseKeyboard
        ? isVietnamesePrefixMatch(val, targetClean, profile.inputMethod)
        : targetClean.startsWith(val);
      if (isCorrectSequence) {
        updateKeyboardGuide(val, targetClean);
      } else {
        playSound('wrong');
        setFeedbackEffect('wrong');
        setErrors(prev => prev + 1);
      }
      return;
    }

    // Let's analyze bubble mode vs standard mode
    if (level.id === 'lvl-10') {
      setTypedValue(val);
      // Check if typed text matches any of the bubbles word
      const cleanedInput = val.trim().toLowerCase();
      const matchedBubble = bubbles.find(b => b.word.toLowerCase() === cleanedInput);

      if (matchedBubble) {
        // Boom! Pop bubble
        playSound('correct');
        triggerConfetti();
        setFeedbackEffect('correct');
        setScore(prev => prev + matchedBubble.word.length * 20); // Longer word, more reward points

        // Remove bubble
        setBubbles(prev => prev.filter(b => b.id !== matchedBubble.id));
        setTypedValue('');
        e.target.value = ''; // clean actual input
        
        // Spawn more bubbles to maintain pace
        setTimeout(spawnBubble, 500);
      } else {
        // Safe input auto-clearing logic: if they press Space and completed a word but it didn't match, or
        // if they pressed Space right after a bubble pop (triggering a trailing stray space like " "),
        // we check if their current typed string matches the start of any active bubble.
        // If it does NOT start any bubble, we automatically clear it so they don't get stuck!
        if (rawInput.endsWith(' ')) {
          const hasPrefixMatch = bubbles.some(b => b.word.toLowerCase().startsWith(cleanedInput + ' '));
          if (!hasPrefixMatch) {
            setTypedValue('');
            e.target.value = '';
          }
        }
      }
      return;
    }

    // STANDARD MODE TYPING PROCESS
    // Auto-advance if fully matches (case-insensitive to support capitalization leniency)
    const valTrimmed = val.trim();
    const isWordComplete = val.toLowerCase() === targetClean.toLowerCase() || 
                           (valTrimmed.toLowerCase() === targetClean.toLowerCase() && rawInput.endsWith(' '));

    if (isWordComplete) {
      // Finished word!
      playSound('correct');
      setFeedbackEffect('correct');
      
      const scoreGain = targetClean.length * 10;
      setScore(prev => prev + scoreGain);
      
      // Clear input
      setTypedValue('');
      e.target.value = '';

      // Advance
      if (currentIndex + 1 >= targetItems.length) {
        // level complete!
        handleLevelComplete();
      } else {
        setCurrentIndex(prev => prev + 1);
        updateKeyboardGuide('', targetItems[currentIndex + 1]);
      }
      return;
    }

    // Check if the input is a valid substring or ongoing Vietnamese typing sequence
    const isCorrectSequence = usesVietnameseKeyboard
      ? isVietnamesePrefixMatch(rawInput, targetClean, profile.inputMethod)
      : targetClean.toLowerCase().startsWith(val.toLowerCase());

    if (isCorrectSequence) {
      // Correct typing path
      setTypedValue(val);
      updateKeyboardGuide(val, targetClean);
    } else {
      // Typos occurred!
      playSound('wrong');
      setFeedbackEffect('wrong');
      setErrors(prev => prev + 1);
      // We still record the typo but don't append to input to encourage correct typing
    }
  };

  const handleLevelComplete = () => {
    setIsPlaying(false);
    calculateGameScores(false);
  };

  const calculateGameScores = (isGameOver: boolean) => {
    // Calculate final metrics
    const durationMin = startTime ? (Date.now() - startTime) / 60000 : 0.1; // fallback to 6s
    const keysCount = keystrokes || 1;
    
    // Calculating WPM (words per minute). Standard word is 5 characters.
    const calculatedWpm = Math.round((keysCount / 5) / (durationMin || 0.1));
    const finalWpm = Math.max(5, Math.min(120, calculatedWpm));
    
    // Accuracy
    const correctKeystrokes = Math.max(0, keysCount - errors);
    const finalAccuracy = Math.round((correctKeystrokes / keysCount) * 100);

    // Star standard rating
    let earnedStars = 1;
    if (isGameOver) {
      earnedStars = 0;
    } else {
      if (finalAccuracy >= 95 && finalWpm >= 25) earnedStars = 3;
      else if (finalAccuracy >= 85 && finalWpm >= 12) earnedStars = 2;
    }

    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    setStars(earnedStars);
    
    // Play big victory if children earned stars
    if (earnedStars > 0) {
      playSound('victory');
      setTimeout(() => playSound('star'), 500);
    } else {
      playSound('wrong');
    }

    setShowResults(true);
    onFinish(earnedStars, score, finalWpm, finalAccuracy);
    
    // Exit fullscreen when results are shown
    setTimeout(() => {
      exitFullscreen();
    }, 500);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setKeystrokes(0);
    setErrors(0);
    setStartTime(null);
    setTypedValue('');
    setBubbles([]);
    setLives(5);
    setIsPlaying(true);
    setShowResults(false);
    playSound('correct');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Determine active finger coordinate
  const currentFinger = getFingerForKey(targetPhysKey || '');

  // Extract unique characters practiced in this level (for home-row & all-rows)
  const getUniqueCharactersOfLevel = () => {
    const charsSet = new Set<string>();
    targetItems.forEach(item => {
      item.toLowerCase().split('').forEach(char => {
        if ((char >= 'a' && char <= 'z') || char === ';') {
          charsSet.add(char);
        }
      });
    });
    return Array.from(charsSet);
  };

  return (
    <div id="game-arena-container" className="space-y-6 text-[#2D3436]">
      {/* Top Header Controls / Metrics Bar */}
      <div className="bg-white rounded-3xl border-none p-4 flex justify-between items-center gap-4 flex-wrap shadow-[0_12px_30px_rgba(60,60,100,0.08)]">
        <button
          id="back-to-map-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#5b8cff] to-[#7aa8ff] text-white font-bold text-sm px-4 py-2.5 rounded-full transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(91,140,255,0.3)] active:translate-y-0"
        >
          <ArrowLeft className="w-4 h-4" /> TRỞ VỀ
        </button>

        <div className="flex items-center gap-2">
          <span className="text-3xl bg-white rounded-2xl p-1 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">{level.icon}</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8a8aa0]">Đang luyện gõ</span>
            <h3 className="font-sans font-black text-[#35354a] leading-tight text-sm uppercase tracking-tight">{level.name}</h3>
          </div>
        </div>

        {/* Live score metrics */}
        <div className="flex items-center gap-3">
          <div className="text-center bg-white px-4 py-2 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
            <div className="text-[9px] text-[#8a8aa0] font-bold uppercase">ĐIỂM</div>
            <div className="text-lg font-black text-[#35354a] font-mono flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#5b8cff] fill-[#5b8cff]" /> {score}
            </div>
          </div>

          {level.id === 'lvl-10' ? (
            <div className="text-center bg-white px-4 py-2 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <div className="text-[9px] text-[#8a8aa0] font-bold uppercase">MẠNG SỐNG</div>
              <div className="flex gap-0.5 justify-center mt-0.5">
                {[1, 2, 3, 4, 5].map((heartIdx) => (
                  <Heart
                    key={heartIdx}
                    className={`w-3.5 h-3.5 ${
                      heartIdx <= lives
                        ? 'text-[#ff7675] fill-[#ff7675]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center bg-white px-4 py-2 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <div className="text-[9px] text-[#8a8aa0] font-bold uppercase">TIẾN TRÌNH</div>
              <div className="text-sm font-black text-[#35354a]">
                ⭐ {currentIndex + 1} / {targetItems.length}
              </div>
            </div>
          )}

          <button
            id="toggle-hand-overlay-btn"
            onClick={() => { playSound('popup'); setShowHandOverlay(!showHandOverlay); }}
            className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-full transition-all hover:translate-y-[-2px] ${
              showHandOverlay 
                ? 'bg-gradient-to-r from-[#5b8cff] to-[#7aa8ff] text-white shadow-[0_8px_20px_rgba(91,140,255,0.3)]' 
                : 'bg-white text-[#35354a] shadow-[0_8px_20px_rgba(0,0,0,0.06)]'
            }`}
            title="Xem cách đặt tay"
          >
            👐 TAY
          </button>

          <button
            id="restart-level-btn"
            onClick={handleRestart}
            className="p-2.5 rounded-full bg-white text-[#35354a] hover:bg-[#f4f4f7] active:scale-95 transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
            title="Gõ Thử Lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Play Arena Section */}
      {false ? (
        <div id="full-page-instruction-screen" className="bg-[#FFFDF6] rounded-3xl border-4 border-[#2D3436] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] space-y-6 w-full animate-scale-up">
          
          {/* Kids-friendly visual banner illustration added for graphic comprehension */}
          <div className="w-full relative h-[180px] sm:h-[240px] md:h-[280px] overflow-hidden rounded-2xl border-4 border-[#2D3436] shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] bg-slate-50">
            <img
              src={typingBanner}
              alt="Bàn phím kỳ thú cùng bé"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 left-3 bg-[#6C5CE7] text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1.5 rounded-full border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]">
              🌈 GÕ PHÍM 10 NGÓN DIỆU KỲ
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 border-b-4 border-[#2D3436] pb-5">
            <span className="text-5xl bg-[#FFEAA7] border-4 border-[#2D3436] p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] animate-bounce-slow">
              {level.icon}
            </span>
            <div className="text-center sm:text-left space-y-1">
              <span className="bg-[#6C5CE7] text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-[#2D3436]">
                HƯỚNG DẪN BÀI HỌC
              </span>
              <h2 className="font-sans font-black text-2xl md:text-3xl tracking-tight text-[#2D3436] uppercase mt-1">
                {level.name}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 italic">
                Cùng nhau gõ chuẩn 10 ngón thật điêu luyện và chính xác để tích luỹ siêu điểm bé nhé!
              </p>
            </div>
          </div>

          {/* Conditional Guidance based on Category */}
          {['vietnamese', 'typing-challenge'].includes(level.category) ? (
            <div className="space-y-6">
              {/* Question to select input technique */}
              <div className="bg-[#A29BFE]/10 border-4 border-[#2D3436] rounded-2xl p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
                <h4 className="font-sans font-black text-sm md:text-base text-[#2D3436] text-center uppercase tracking-tight flex items-center justify-center gap-2">
                  🇻🇳 CHỌN KIỂU GÕ TIẾNG VIỆT CHO BÉ
                </h4>
                <p className="text-xs text-slate-600 font-bold text-center">
                  Bé muốn học gõ theo kiểu gõ nào hôm nay? Bấm chọn một kiểu gõ để xem hướng dẫn phù hợp nha!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('popup');
                      onUpdateInputMethod?.('telex');
                    }}
                    className={`relative p-5 rounded-3xl text-left transition-all duration-250 ${
                      profile.inputMethod === 'telex'
                        ? 'bg-white shadow-[0_12px_30px_rgba(60,60,100,0.08)] hover:shadow-[0_18px_40px_rgba(91,140,255,0.25)] hover:translate-y-[-3px] scale-102 border-2 border-[#5b8cff]/30'
                        : 'bg-white shadow-[0_12px_30px_rgba(60,60,100,0.08)] hover:shadow-[0_18px_40px_rgba(91,140,255,0.25)] hover:translate-y-[-3px] border-0'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-sans font-black text-sm md:text-base text-[#35354a]">⌨️ Kiểu gõ TELEX</span>
                      {profile.inputMethod === 'telex' && (
                        <span className="bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white border-0 text-[9px] font-black py-1 px-3 rounded-full uppercase shadow-[0_4px_12px_rgba(91,140,255,0.25)]">ĐANG CHỌN</span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs font-semibold leading-relaxed text-[#8a8aa0]">
                      Phổ biến và thông dụng nhất! Dùng chữ cái để gõ dấu: ví dụ gõ <strong className="text-[#5b8cff]">aa</strong> ra <strong className="text-[#5b8cff]">â</strong>, gõ <strong className="text-[#5b8cff]">s</strong> ra dấu <strong className="text-[#5b8cff]">sắc</strong>.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('popup');
                      onUpdateInputMethod?.('vni');
                    }}
                    className={`relative p-5 rounded-3xl text-left transition-all duration-250 ${
                      profile.inputMethod === 'vni'
                        ? 'bg-white shadow-[0_12px_30px_rgba(60,60,100,0.08)] hover:shadow-[0_18px_40px_rgba(91,140,255,0.25)] hover:translate-y-[-3px] scale-102 border-2 border-[#5b8cff]/30'
                        : 'bg-white shadow-[0_12px_30px_rgba(60,60,100,0.08)] hover:shadow-[0_18px_40px_rgba(91,140,255,0.25)] hover:translate-y-[-3px] border-0'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-sans font-black text-sm md:text-base text-[#35354a]">🔢 Kiểu gõ VNI</span>
                      {profile.inputMethod === 'vni' && (
                        <span className="bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white border-0 text-[9px] font-black py-1 px-3 rounded-full uppercase shadow-[0_4px_12px_rgba(91,140,255,0.25)]">ĐANG CHỌN</span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs font-semibold leading-relaxed text-[#8a8aa0]">
                      Cực kỳ dễ nhớ! Dùng hàng phím số từ 1 đến 9 để gõ dấu: ví dụ gõ <strong className="text-[#5b8cff]">a6</strong> ra <strong className="text-[#5b8cff]">â</strong>, gõ <strong className="text-[#5b8cff]">1</strong> ra dấu <strong className="text-[#5b8cff]">sắc</strong>.
                    </p>
                  </button>
                </div>
              </div>

              {/* Guidelines for Vietnamese accents */}
              <div className="bg-white border-4 border-[#2D3436] rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] space-y-4">
                <h4 className="font-sans font-black uppercase text-[#2D3436] text-sm flex items-center gap-1.5 border-b-2 border-[#2D3436] pb-2">
                  📝 QUY TẮC GÕ TIẾNG VIỆT CHUẨN KIỂU {profile.inputMethod === 'telex' ? 'TELEX' : 'VNI'}
                </h4>
                
                {profile.inputMethod === 'telex' ? (
                  <div className="space-y-4 text-xs font-semibold text-slate-700">
                    <div>
                      <p className="font-black text-[#2D3436] mb-1.5 flex items-center gap-1">✨ Gõ mũ và dấu móc:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          a + a &rarr; <strong>â</strong>
                        </div>
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          o + o &rarr; <strong>ô</strong>
                        </div>
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          e + e &rarr; <strong>ê</strong>
                        </div>
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          d + d &rarr; <strong>đ</strong>
                        </div>
                        <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)] col-span-1">
                          a + w &rarr; <strong>ă</strong>
                        </div>
                        <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)] col-span-1">
                          o + w &rarr; <strong>ơ</strong>
                        </div>
                        <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)] col-span-2">
                          u + w (hoặc w) &rarr; <strong>ư</strong>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-[#2D3436] mb-1.5 flex items-center gap-1">🎨 Gõ các loại dấu thanh:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div className="bg-rose-50 border-2 border-rose-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-rose-600">s</strong> &rarr; <strong>sắc (´)</strong>
                        </div>
                        <div className="bg-sky-50 border-2 border-sky-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-sky-600">f</strong> &rarr; <strong>huyền (`)</strong>
                        </div>
                        <div className="bg-amber-50 border-2 border-amber-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-amber-600">r</strong> &rarr; <strong>hỏi (?)</strong>
                        </div>
                        <div className="bg-purple-50 border-2 border-purple-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-purple-600">x</strong> &rarr; <strong>ngã (~)</strong>
                        </div>
                        <div className="bg-emerald-50 border-2 border-emerald-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-emerald-600">j</strong> &rarr; <strong>nặng (.)</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs font-semibold text-slate-700">
                    <div>
                      <p className="font-black text-[#2D3436] mb-1.5 flex items-center gap-1">✨ Gõ mũ và dấu móc:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          a + 6 &rarr; <strong>â</strong>
                        </div>
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          o + 6 &rarr; <strong>ô</strong>
                        </div>
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          e + 6 &rarr; <strong>ê</strong>
                        </div>
                        <div className="bg-[#FFEAA7]/30 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          d + 9 &rarr; <strong>đ</strong>
                        </div>
                        <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          a + 8 &rarr; <strong>ă</strong>
                        </div>
                        <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)] col-span-1">
                          o + 7 &rarr; <strong>ơ</strong>
                        </div>
                        <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-2 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)] col-span-2">
                          u + 7 &rarr; <strong>ư</strong>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-[#2D3436] mb-1.5 flex items-center gap-1">🎨 Gõ các loại dấu thanh:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div className="bg-rose-50 border-2 border-rose-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-rose-600">1</strong> &rarr; <strong>sắc (´)</strong>
                        </div>
                        <div className="bg-sky-50 border-2 border-sky-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-sky-600">2</strong> &rarr; <strong>huyền (`)</strong>
                        </div>
                        <div className="bg-amber-50 border-2 border-amber-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-amber-600">3</strong> &rarr; <strong>hỏi (?)</strong>
                        </div>
                        <div className="bg-purple-50 border-2 border-purple-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-purple-600">4</strong> &rarr; <strong>ngã (~)</strong>
                        </div>
                        <div className="bg-emerald-50 border-2 border-emerald-300 p-2.5 rounded-xl text-center font-mono text-[11px] shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                          phím <strong className="text-emerald-600">5</strong> &rarr; <strong>nặng (.)</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Core Guide Grid: Two separate cards for left and right hands */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT HAND CARD */}
                <div className="bg-[#FFF5F5] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(255,118,117,0.3)]">
                  <div className="text-center mb-6">
                    <h3 className="font-sans font-black text-xl md:text-2xl text-[#FF7675] uppercase tracking-wide flex items-center justify-center gap-2">
                      ✋ TAY TRÁI
                    </h3>
                  </div>

                  {/* Home Row Keys */}
                  <div className="bg-white border-4 border-[#2D3436] rounded-2xl p-4 mb-4 shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]">
                    <h4 className="font-black text-xs uppercase text-slate-600 mb-3 text-center">📍 Hàng Cơ Sở</h4>
                    <div className="flex justify-center gap-2 font-mono text-lg font-black">
                      <div className="w-12 h-12 bg-[#FFEAA7] border-3 border-[#2D3436] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] text-[#FF6B6B]">A</div>
                      <div className="w-12 h-12 bg-[#FFEAA7] border-3 border-[#2D3436] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] text-[#FF9F43]">S</div>
                      <div className="w-12 h-12 bg-[#FFEAA7] border-3 border-[#2D3436] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] text-[#FFC312]">D</div>
                      <div className="w-12 h-12 bg-red-100 border-4 border-red-500 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(239,83,80,1)] text-[#EE5253] relative">
                        <span>F</span>
                        <span className="w-3 h-1 bg-[#EE5253] rounded-full absolute bottom-1"></span>
                      </div>
                    </div>
                  </div>

                  {/* Finger Guide Sections */}
                  <div className="space-y-3">
                    <div className="bg-pink-50 border-2 border-pink-300 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(236,72,153,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-pink-500">💗</span>
                        <span className="font-black text-sm text-pink-700">Ngón Út</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-pink-600 bg-white border-2 border-pink-200 rounded-lg px-3 py-1.5 text-center">
                        1, Q, A, Z
                      </div>
                    </div>

                    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(251,146,60,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-500">🧡</span>
                        <span className="font-black text-sm text-orange-700">Ngón Áp Út</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-orange-600 bg-white border-2 border-orange-200 rounded-lg px-3 py-1.5 text-center">
                        2, W, S, X
                      </div>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(245,158,11,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-500">💛</span>
                        <span className="font-black text-sm text-amber-700">Ngón Giữa</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-amber-600 bg-white border-2 border-amber-200 rounded-lg px-3 py-1.5 text-center">
                        3, E, D, C
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(250,204,21,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-500">💛</span>
                        <span className="font-black text-sm text-yellow-700">Ngón Trỏ</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-yellow-600 bg-white border-2 border-yellow-200 rounded-lg px-3 py-1.5 text-center">
                        4, 5, R, T, F, G, V, B
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT HAND CARD */}
                <div className="bg-[#E1F5FE] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(9,132,227,0.3)]">
                  <div className="text-center mb-6">
                    <h3 className="font-sans font-black text-xl md:text-2xl text-[#0984E3] uppercase tracking-wide flex items-center justify-center gap-2">
                      🤚 TAY PHẢI
                    </h3>
                  </div>

                  {/* Home Row Keys */}
                  <div className="bg-white border-4 border-[#2D3436] rounded-2xl p-4 mb-4 shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]">
                    <h4 className="font-black text-xs uppercase text-slate-600 mb-3 text-center">📍 Hàng Cơ Sở</h4>
                    <div className="flex justify-center gap-2 font-mono text-lg font-black">
                      <div className="w-12 h-12 bg-blue-100 border-4 border-blue-500 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] text-[#0984E3] relative">
                        <span>J</span>
                        <span className="w-3 h-1 bg-[#0984E3] rounded-full absolute bottom-1"></span>
                      </div>
                      <div className="w-12 h-12 bg-[#74B9FF]/30 border-3 border-[#2D3436] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] text-[#10AC84]">K</div>
                      <div className="w-12 h-12 bg-[#74B9FF]/30 border-3 border-[#2D3436] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] text-[#FF9F43]">L</div>
                      <div className="w-12 h-12 bg-[#74B9FF]/30 border-3 border-[#2D3436] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] text-[#FF6B6B]">;</div>
                    </div>
                  </div>

                  {/* Finger Guide Sections */}
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(250,204,21,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-500">💛</span>
                        <span className="font-black text-sm text-yellow-700">Ngón Trỏ</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-yellow-600 bg-white border-2 border-yellow-200 rounded-lg px-3 py-1.5 text-center">
                        6, 7, Y, U, H, J, N, M
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(59,130,246,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-500">�</span>
                        <span className="font-black text-sm text-blue-700">Ngón Giữa</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-blue-600 bg-white border-2 border-blue-200 rounded-lg px-3 py-1.5 text-center">
                        8, I, K, M
                      </div>
                    </div>

                    <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(99,102,241,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-indigo-500">💜</span>
                        <span className="font-black text-sm text-indigo-700">Ngón Áp Út</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-indigo-600 bg-white border-2 border-indigo-200 rounded-lg px-3 py-1.5 text-center">
                        9, O, L, .
                      </div>
                    </div>

                    <div className="bg-violet-50 border-2 border-violet-300 rounded-xl p-3 shadow-[1px_1px_0px_0px_rgba(139,92,246,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-violet-500">�</span>
                        <span className="font-black text-sm text-violet-700">Ngón Út</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-violet-600 bg-white border-2 border-violet-200 rounded-lg px-3 py-1.5 text-center">
                        0, -, =, P, [, ], \
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Unique layout Keys and associated fingers cards */}
              {getUniqueCharactersOfLevel().length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT HAND KEYS CARD */}
                  <div className="bg-[#FFF5F5] rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(255,118,117,0.3)]">
                    <h4 className="font-sans font-black text-sm md:text-base text-[#FF7675] uppercase tracking-tight flex items-center gap-1.5 mb-3">
                      ✋ CÁC PHÍM TAY TRÁI
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getUniqueCharactersOfLevel()
                        .filter(char => {
                          const fingerInfo = getFingerLabel(char);
                          return fingerInfo.side === 'Tay Trái';
                        })
                        .map(char => {
                          const fingerInfo = getFingerLabel(char);
                          return (
                            <div key={char} className={`border-2 border-[#2D3436] p-3 rounded-xl text-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] ${fingerInfo.colorClass}`}>
                              <span className="block text-xl font-mono font-black uppercase text-[#2D3436] bg-white border-2 border-[#2D3436] w-9 h-9 flex items-center justify-center mx-auto rounded-lg mb-1 shadow-sm">
                                {char}
                              </span>
                              <div className="text-[10px] sm:text-[11px] leading-tight font-black uppercase tracking-tight text-slate-700 mt-1">
                                {fingerInfo.name.replace(/ Tay (Trái|Phải)/, '')}
                              </div>
                            </div>
                          );
                        })}
                      {getUniqueCharactersOfLevel().filter(char => getFingerLabel(char).side === 'Tay Trái').length === 0 && (
                        <div className="col-span-2 sm:col-span-3 text-center text-xs font-semibold text-slate-500 py-4">
                          Không có phím tay trái trong bài học này
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT HAND KEYS CARD */}
                  <div className="bg-[#E1F5FE] rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(9,132,227,0.3)]">
                    <h4 className="font-sans font-black text-sm md:text-base text-[#0984E3] uppercase tracking-tight flex items-center gap-1.5 mb-3">
                      🤚 CÁC PHÍM TAY PHẢI
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getUniqueCharactersOfLevel()
                        .filter(char => {
                          const fingerInfo = getFingerLabel(char);
                          return fingerInfo.side === 'Tay Phải';
                        })
                        .map(char => {
                          const fingerInfo = getFingerLabel(char);
                          return (
                            <div key={char} className={`border-2 border-[#2D3436] p-3 rounded-xl text-center shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] ${fingerInfo.colorClass}`}>
                              <span className="block text-xl font-mono font-black uppercase text-[#2D3436] bg-white border-2 border-[#2D3436] w-9 h-9 flex items-center justify-center mx-auto rounded-lg mb-1 shadow-sm">
                                {char}
                              </span>
                              <div className="text-[10px] sm:text-[11px] leading-tight font-black uppercase tracking-tight text-slate-700 mt-1">
                                {fingerInfo.name.replace(/ Tay (Trái|Phải)/, '')}
                              </div>
                            </div>
                          );
                        })}
                      {getUniqueCharactersOfLevel().filter(char => getFingerLabel(char).side === 'Tay Phải').length === 0 && (
                        <div className="col-span-2 sm:col-span-3 text-center text-xs font-semibold text-slate-500 py-4">
                          Không có phím tay phải trong bài học này
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button at the bottom center to close overlay and let the fun begin */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              id="start-training-primary-btn"
              onClick={() => {
                playSound('victory');
                setShowInstructionScreen(false);
              }}
              className="text-base md:text-lg font-black uppercase border-4 border-[#2D3436] py-3.5 px-10 rounded-2xl bg-[#55EFC4] text-[#2D3436] shadow-[6px_6px_0px_0px_rgba(45,52,54,1)] transition-all hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_0px_rgba(45,52,54,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] flex items-center gap-3 animate-bounce-slow"
            >
              🚀 SẴN SÀNG, BẮT ĐẦU LUYỆN TẬP!
            </button>
          </div>
        </div>
      ) : !showResults ? (
        <div className="w-full space-y-6">
          {/* Main Target Type Box */}
          <div id="active-typing-panel" className="w-full space-y-6">
            <div className={`relative bg-white rounded-3xl border-4 p-8 shadow-[6px_6px_0px_0px_rgba(45,52,54,1)] min-h-[300px] flex flex-col justify-between transition-all duration-100 ${
              hitEffect === 'correct'
                ? 'bg-[#55EFC4]/10 border-[#55EFC4]'
                : hitEffect === 'wrong'
                ? 'bg-[#FF7675]/10 border-[#FF7675]'
                : 'border-[#2D3436]'
            }`}>
              
              {/* Confetti sparkle overlays */}
              {showConfetti && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-6xl animate-bounce">🎉🌸✨🍿🎈</span>
                </div>
              )}

              {/* HAND PLACEMENT VIRTUAL TUTORIAL OVERLAY */}
              {showHandOverlay && (
                <div id="hand-placement-overlay" className="absolute inset-0 bg-[#FFFDF6] z-30 rounded-[22px] p-5 flex flex-col justify-between border-4 border-[#2D3436] shadow-2xl animate-scale-up overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b-2 border-dashed border-[#2D3436] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl animate-bounce">👐</span>
                        <div>
                          <h4 className="font-sans font-black text-sm md:text-base text-[#2D3436] uppercase tracking-tight">HƯỚNG DẪN KHỞI ĐỘNG ĐẶT TAY</h4>
                          <p className="text-[9px] text-[#6C5CE7] font-black uppercase tracking-wider">Học gõ 10 ngón chuẩn thế giới cùng bạn thú</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#FFEAA7] border-2 border-[#2D3436] px-2 py-0.5 rounded-full font-black text-[#2D3436]">Bé ơi nhìn đây!</span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-700 leading-relaxed bg-[#FFFFF0] border border-[#2D3436] p-2 rounded-xl">
                      💡 <strong>Bí kíp tí hon:</strong> Nhìn trên bàn phím thật, tại 2 phím <span className="font-mono bg-white border border-[#2D3436] px-1.5 py-0.2 rounded text-red-500 font-extrabold">F</span> và <span className="font-mono bg-white border border-[#2D3436] px-1.5 py-0.2 rounded text-indigo-600 font-extrabold">J</span> có <strong>gờ nổi nhỏ</strong>. Bé hãy đặt 2 ngón trỏ vào đây để tìm đúng "nhà" mà không cần nhìn phím nhé!
                    </p>

                    {/* Virtual Hand Placement Diagram */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Left hand home keys */}
                      <div className="bg-[#FF7675]/10 border-2 border-[#2D3436] p-3 rounded-2xl relative shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]">
                        <h5 className="font-black text-xs text-[#2D3436] mb-1.5 uppercase flex items-center gap-1">✋ TAY TRÁI (A S D F)</h5>
                        <ul className="text-[10px] sm:text-xs font-semibold text-slate-700 space-y-1">
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-rose-500">A</span> 🔴 Ngón ÚT đặt đây</li>
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-pink-500">S</span> 🟢 Ngón ÁP ÚT đặt đây</li>
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-amber-500">D</span> 🔵 Ngón GIỮA đặt đây</li>
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-yellow-500">F</span> 🟡 Ngón TRỎ (tìm gờ nổi)</li>
                        </ul>
                      </div>

                      {/* Right hand home keys */}
                      <div className="bg-[#74B9FF]/10 border-2 border-[#2D3436] p-3 rounded-2xl relative shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]">
                        <h5 className="font-black text-xs text-[#2D3436] mb-1.5 uppercase flex items-center gap-1">🤚 TAY PHẢI (J K L ;)</h5>
                        <ul className="text-[10px] sm:text-xs font-semibold text-slate-700 space-y-1">
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-[#74B9FF]">J</span> 🟡 Ngón TRỎ (tìm gờ nổi)</li>
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-indigo-500">K</span> 🔵 Ngón GIỮA đặt đây</li>
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-purple-500">L</span> 🟢 Ngón ÁP ÚT đặt đây</li>
                          <li className="flex items-center gap-1.5"><span className="w-5 text-center font-mono bg-white border border-[#2D3436] px-1 rounded-md font-bold text-violet-500">;</span> 🔴 Ngón ÚT đặt đây</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white border text-[#2D3436] border-[#2D3436] rounded-xl p-1.5 text-center text-[10px] sm:text-xs font-black flex items-center justify-center gap-1">
                      ⭐ ngón cái 2 tay gõ phím rộng dài <span className="font-mono bg-[#E8F0FE] px-2 py-0.5 rounded border border-[#2D3436]">SPACE ⌴</span> nhé!
                    </div>
                  </div>

                  <button
                    id="close-hand-overlay-btn"
                    onClick={() => {
                      playSound('victory');
                      setShowHandOverlay(false);
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 100);
                    }}
                    className="w-full bg-[#55EFC4] text-[#2D3436] font-sans font-black text-base py-2 rounded-2xl border-2 border-[#2D3436] shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(45,52,54,1)] active:translate-y-0 text-center uppercase tracking-wider mt-3"
                  >
                    Bé đã hiểu, sẵn sàng gõ phím! 🚀
                  </button>
                </div>
              )}

              {/* BUBBLE POP GAME ARENA */}
              {level.id === 'lvl-10' ? (
                <div className="relative w-full h-[320px] bg-[#74B9FF]/20 border-4 border-dashed border-[#2D3436] rounded-2xl overflow-hidden">
                  
                  {/* Floating Bubbles */}
                  {bubbles.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        left: `${b.x}%`,
                        bottom: `${b.y}px`,
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                      }}
                      className={`absolute rounded-full bg-gradient-to-tr ${b.color} text-white flex flex-col items-center justify-center p-3 text-center border-4 border-[#2D3436] shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] select-none transition-all duration-200 active:scale-95`}
                    >
                      <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded-full font-mono font-black tracking-tight uppercase mb-0.5">Bóng</span>
                      <strong className="text-sm md:text-base font-sans font-black drop-shadow-md tracking-tight">
                        {b.word}
                      </strong>
                    </div>
                  ))}

                  {/* Empty state instruction inside pool */}
                  {bubbles.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-600">
                      <span className="text-4xl animate-bounce mb-2">🎈</span>
                      <p className="font-black text-[#2D3436] uppercase tracking-tight">Đang tải bong bóng từ dưới nước...</p>
                      <p className="text-xs font-semibold">Bé sẵn sàng bàn tay để bắt bóng nhé!</p>
                    </div>
                  )}

                  {/* Ceiling warning red indicator line */}
                  <div className="absolute top-1 left-0 right-0 h-1 bg-dashed border-t border-rose-400 opacity-60 pointer-events-none" />
                </div>
              ) : level.id === 'lvl-9' ? (
                /* LEVEL 9 - CUSTOM TEXT INPUT PANEL */
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-6 w-full max-w-3xl">
                  {/* Category flag banner */}
                  <span className="bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white font-black uppercase px-4 py-2 rounded-full text-sm shadow-[0_8px_20px_rgba(91,140,255,0.25)]">
                    ⌨️ Tập Gõ Văn Bản Của Em
                  </span>

                  {/* Custom Text Input Area */}
                  <div className="w-full space-y-4">
                    {!isTypingMode ? (
                      <>
                        <label className="block text-[#35354a] font-sans font-black text-sm uppercase tracking-wide">
                          📝 Nhập đoạn văn em muốn luyện gõ:
                        </label>
                        <textarea
                          id="lvl-9-custom-text-input"
                          value={customTextInput}
                          onChange={(e) => {
                            setCustomTextInput(e.target.value);
                            setCurrentIndex(0);
                            setTypedValue('');
                            playSound('key-press');
                          }}
                          placeholder="Nhập vào đây đoạn văn bản em yêu thích để bắt đầu luyện gõ..."
                          className="w-full min-h-[120px] p-4 rounded-2xl border-0 bg-[#f4f4f7] text-[#35354a] font-sans text-base font-semibold shadow-[0_12px_30px_rgba(60,60,100,0.08)] focus:shadow-[0_18px_40px_rgba(91,140,255,0.25)] transition-all resize-none placeholder:text-[#8a8aa0]"
                        />
                        
                        {customTextInput.trim() && (
                          <div className="bg-gradient-to-br from-[#5b8cff]/10 to-[#7aa8ff]/10 border-2 border-[#5b8cff]/30 rounded-2xl p-4">
                            <p className="text-xs text-[#8a8aa0] font-bold mb-2">
                              ✨ Đoạn văn của em có <span className="text-[#5b8cff] font-black">{customTextInput.trim().length}</span> ký tự
                            </p>
                            <button
                              onClick={() => {
                                const sents = getSentences(customTextInput);
                                setSentences(sents);
                                setCurrentSentenceIndex(0);
                                setCurrentIndex(0);
                                setTypedValue('');
                                setIsTypingMode(true);
                                inputRef.current?.focus();
                                playSound('popup');
                              }}
                              className="bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white font-sans font-black text-sm py-2 px-6 rounded-full shadow-[0_8px_20px_rgba(91,140,255,0.25)] transition-all hover:translate-y-[-2px] active:translate-y-0"
                            >
                              🚀 Bắt đầu gõ ngay!
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-[#8a8aa0] font-black uppercase">
                          Câu {currentSentenceIndex + 1} / {sentences.length}
                        </p>
                        <button
                          onClick={() => {
                            setIsTypingMode(false);
                            setSentences([]);
                            setCurrentSentenceIndex(0);
                            setCurrentIndex(0);
                            setTypedValue('');
                            playSound('click');
                          }}
                          className="text-xs text-[#8a8aa0] font-bold hover:text-[#5b8cff] transition-colors underline"
                        >
                          ← Quay lại chỉnh sửa
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Display current target when typing */}
                  {isTypingMode && sentences.length > 0 && (
                    <div className="space-y-4 pt-4 border-t-2 border-dashed border-[#e8e8ed] w-full">
                      <p className="text-xs text-[#8a8aa0] font-black uppercase">Đang gõ:</p>
                      <div id="target-item-word" className="text-3xl md:text-4xl font-sans tracking-wide font-black text-[#35354a] select-none flex justify-center items-center flex-wrap gap-x-1 gap-y-2">
                        {currentItem.split('').map((char, index) => {
                          let color;
                          let bg = '';
                          if (index < typedValue.length) {
                            color = 'text-emerald-500 font-bold';
                          } else if (index === typedValue.length) {
                            color = 'text-[#5b8cff] animate-pulse underline decoration-[#FDCB6E] decoration-4 underline-offset-8';
                            bg = 'bg-[#5b8cff]/10 px-1 rounded';
                          } else {
                            color = 'text-slate-300';
                          }
                          return (
                            <span key={index} className={`${color} ${bg} transition-all duration-150 transform hover:scale-110 px-0.5`}>
                              {char === ' ' ? '␣' : char}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* REGULAR TEXT CORNER WRITER */
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-6">
                  {/* Category flag banner */}
                  <span className="bg-[#6C5CE7] border-2 border-[#2D3436] text-white font-black uppercase px-3 py-1 rounded-full text-xs shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]">
                    Mời Bé Gõ:
                  </span>

                  {/* BIG CHUBBY PRACTICING WORDS */}
                  <div className="space-y-4">
                    <div id="target-item-word" className="text-4xl md:text-5xl font-sans tracking-wide font-black text-[#2D3436] select-none flex justify-center items-center flex-wrap gap-x-1 gap-y-2">
                      {currentItem.split('').map((char, index) => {
                        let color;
                        let bg = '';
                        if (index < typedValue.length) {
                          color = 'text-emerald-500 font-bold'; // Correctly typed
                        } else if (index === typedValue.length) {
                          color = 'text-[#6C5CE7] animate-pulse underline decoration-[#FDCB6E] decoration-4 underline-offset-8'; // typing cursor focus
                          bg = 'bg-[#6C5CE7]/10 px-1 rounded';
                        } else {
                          color = 'text-slate-300'; // Upcoming
                        }
                        return (
                          <span key={index} className={`${color} ${bg} transition-all duration-150 transform hover:scale-110 px-0.5`}>
                            {char === ' ' ? '␣' : char}
                          </span>
                        );
                      })}
                    </div>

                    {/* Cute child-friendly illustration hints for letters or tones */}
                    {currentFormula && (
                      <div className="inline-block bg-[#FFEAA7] border-2 border-[#2D3436] text-[#2D3436] font-sans font-black text-sm px-4 py-2 rounded-2xl shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] animate-bounce-slow">
                        💡 Thần chú ghép phím: <span className="font-mono bg-white border border-[#2D3436] px-2 py-0.5 rounded text-[#6C5CE7] font-black">{currentFormula}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shared Typing Capturer Bar */}
              <div className="pt-4 border-t-2 border-[#2D3436] flex flex-col items-center gap-3">
                {level.id === 'lvl-10' ? (
                  <p className="text-xs text-slate-600 font-extrabold uppercase">Gõ từ trong quả bóng rồi bấm nút <kbd className="bg-white border-2 border-[#2D3436] px-1.5 py-0.5 rounded font-bold text-slate-800">Space ⌴ (Khoảng trắng)</kbd> để bắt bóng</p>
                ) : (
                  <p className="text-xs text-slate-600 font-extrabold uppercase">Gõ chữ theo mẫu trên màn hình máy tính.</p>
                )}

                <div className="relative w-full max-w-md h-[58px]">
                  {/* Real input - hidden visually but focused, type="password" to bypass system IME */}
                  <input
                    id="typing-invisible-buffer"
                    ref={inputRef}
                    type="password"
                    value={typedValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  
                  {/* Visual representation of the input */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl border-4 border-[#2D3436] text-[#2D3436] shadow-inner transition-all flex items-center justify-center text-xl font-black font-sans tracking-wider px-6 ${
                      isFocused ? 'bg-white' : 'bg-[#FFFDF6]'
                    }`}
                  >
                    {typedValue ? (
                      <span className="relative inline-flex items-center" style={{ whiteSpace: 'pre-wrap' }}>
                        {typedValue}
                        <span className="inline-block w-[3px] h-6 bg-[#2D3436] ml-1 animate-pulse"></span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold select-none text-sm sm:text-base">
                        {level.id === 'lvl-10' ? "Gõ rồi gõ Khoảng Trắng..." : "Sẵn sàng bàn tay, gõ vào đây..."}
                      </span>
                    )}
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none z-20">
                    {/* <span className="text-[9px] sm:text-[10px] text-white font-extrabold bg-[#00B894] border border-[#2D3436] px-2 py-1 rounded animate-pulse shadow-sm">
                      🛡️ TỰ ĐỘNG BỎ QUA BỘ GÕ MÁY
                    </span> */}
                    <span className="text-[10px] text-[#2D3436] font-bold bg-[#FFEAA7] border border-[#2D3436] px-2 py-1 rounded">BÀN PHÍM BÉ</span>
                  </div>
                </div>

                {/* Back-up input focus trigger */}
                <button
                  id="focus-regain-trigger"
                  onClick={() => inputRef.current?.focus()}
                  className="text-xs text-[#6C5CE7] hover:underline font-black transition-colors mt-1"
                >
                  👉 Bấm vào đây nếu không gõ được chữ bé nhé!
                </button>
              </div>
            </div>

            {/* Live Keyboard display */}
            <Keyboard targetKey={targetPhysKey} pressedKey={pressedKey} />

            {/* Horizontal Finger Guide (HandsVisualizer) now placed beautifully under the keyboard */}
            <div className="mt-5">
              <HandsVisualizer activeFinger={currentFinger} />
            </div>

            {/* Vietnamese Tone Rules displayed below keyboard to remind child on-the-fly */}
            {isVietnameseLevel && (
              <div id="tone-rules-under-keyboard-reminder" className="bg-[#FFFFF0] border-4 border-[#2D3436] rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] space-y-2.5">
                <h5 className="font-sans font-black text-xs text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                  💡 BÍ KÍP GÕ DẤU TIẾNG VIỆT ({profile.inputMethod === 'telex' ? 'TELEX' : 'VNI'}):
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
                  {profile.inputMethod === 'telex' ? (
                    <>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-rose-500 font-black">s</span> &rarr; sắc (´)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-sky-500 font-black">f</span> &rarr; huyền (`)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-amber-500 font-black">r</span> &rarr; hỏi (?)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-purple-500 font-black">x</span> &rarr; ngã (~)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-emerald-500 font-black">j</span> &rarr; nặng (.)
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-rose-500 font-black">1</span> &rarr; sắc (´)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-sky-500 font-black">2</span> &rarr; huyền (`)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-amber-500 font-black">3</span> &rarr; hỏi (?)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-purple-500 font-black">4</span> &rarr; ngã (~)
                      </div>
                      <div className="bg-white border-2 border-[#2D3436] p-1.5 rounded-xl shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]">
                        <span className="font-mono text-emerald-500 font-black">5</span> &rarr; nặng (.)
                      </div>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] md:text-xs font-semibold text-slate-700 font-sans mt-1.5">
                  {profile.inputMethod === 'telex' ? (
                    <>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>aa</strong> &rarr; â | <strong>ee</strong> &rarr; ê
                      </div>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>oo</strong> &rarr; ô | <strong>dd</strong> &rarr; đ
                      </div>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>aw</strong> &rarr; ă | <strong>ow</strong> &rarr; ơ
                      </div>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>uw</strong> &rarr; ư | <strong>w</strong> &rarr; ư
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>a6</strong> &rarr; â | <strong>e6</strong> &rarr; ê
                      </div>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>o6</strong> &rarr; ô | <strong>d9</strong> &rarr; đ
                      </div>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>a8</strong> &rarr; ă | <strong>o7</strong> &rarr; ơ
                      </div>
                      <div className="bg-white border border-[#2D3436]/40 p-1.5 rounded-lg text-center font-mono">
                        <strong>u7</strong> &rarr; ư
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>


        </div>
      ) : (
        /* GAME OVER / RESULTS PRESENTATION CARD */
        <div id="game-results-panel" className="max-w-xl mx-auto bg-white rounded-3xl border-none p-8 text-center animate-scale-up space-y-6 shadow-[0_18px_40px_rgba(91,140,255,0.25)]">
          <div className="space-y-2">
            <span className="text-6xl inline-block animate-bounce mb-2">
              {stars > 0 ? '🏆' : '😿'}
            </span>
            <h2 className="text-3xl font-sans font-black text-[#35354a] uppercase italic tracking-tight">
              {stars > 0 ? 'CẤP ĐỘ HOÀN THÀNH!' : 'BÉ GẦN LÀM ĐƯỢC RỒI!'}
            </h2>
            <p className="text-[#8a8aa0] font-bold">
              {stars > 0 ? 'Dưới đây là điểm học gõ siêu tốc của bé:' : 'Đừng nản lòng bé nhé, tay gõ phím nhiều sẽ quen ngay!'}
            </p>
          </div>

          {/* Star animation block */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-14 h-14 ${
                  starIdx <= stars
                    ? 'text-[#5b8cff] fill-[#5b8cff] scale-110 drop-shadow-md'
                    : 'text-gray-200'
                } transition-all duration-500`}
              />
            ))}
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-white p-4 rounded-2xl shadow-[0_12px_30px_rgba(60,60,100,0.08)]">
              <Zap className="w-6 h-6 text-[#5b8cff] mx-auto mb-1 animate-pulse" />
              <div className="text-2xl font-black text-[#35354a] font-mono">{score}</div>
              <div className="text-[10px] text-[#8a8aa0] font-bold uppercase mt-0.5">TỔNG ĐIỂM</div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-[0_12px_30px_rgba(60,60,100,0.08)]">
              <Sparkles className="w-6 h-6 text-[#7aa8ff] mx-auto mb-1" />
              <div className="text-2xl font-black text-[#35354a] font-mono">{wpm}</div>
              <div className="text-[10px] text-[#8a8aa0] font-bold uppercase mt-0.5">Tốc Độ (WPM)</div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-[0_12px_30px_rgba(60,60,100,0.08)]">
              <Award className="w-6 h-6 text-[#5b8cff] mx-auto mb-1" />
              <div className="text-2xl font-black text-[#35354a] font-mono">{accuracy}%</div>
              <div className="text-[10px] text-[#8a8aa0] font-bold uppercase mt-0.5">Chính Xác</div>
            </div>
          </div>

          {/* Mini level reward message */}
          {stars >= 2 && level.badgeToUnlock && (
            <div className="p-4 bg-gradient-to-r from-[#eef7ff] to-[#f8fcff] border-2 border-dashed border-[#5b8cff]/30 rounded-2xl flex items-center justify-center gap-2.5 text-left">
              <span className="text-3xl">🎁</span>
              <div>
                <h5 className="font-black text-[#35354a] text-sm uppercase">BÉ ĐƯỢC MỞ KHÓA HUY HIỆU MỚI!</h5>
                <p className="text-xs font-semibold text-[#8a8aa0]">Vào bộ sưu tập danh dự để kiểm tra nhé!</p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              id="results-restart-btn"
              onClick={handleRestart}
              className="flex-1 bg-gradient-to-r from-[#5b8cff] to-[#7aa8ff] text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_12px_30px_rgba(91,140,255,0.3)] transition-all flex items-center justify-center gap-1.5 hover:translate-y-[-2px] hover:shadow-[0_18px_40px_rgba(91,140,255,0.4)] active:translate-y-0"
            >
              <RotateCcw className="w-5 h-5" /> LUYỆN LẠI
            </button>
            <button
              id="results-back-btn"
              onClick={onBack}
              className="flex-1 bg-white text-[#35354a] font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:bg-[#f4f4f7] text-center"
            >
              Trở Về
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
