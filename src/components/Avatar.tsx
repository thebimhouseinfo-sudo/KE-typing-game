import React from 'react';
import avatarSpriteSheet from '../avatar.png';

interface AvatarProps {
  avatar: string;
  className?: string;
}

export const AVATAR_MAP: Record<string, { row: number; col: number; name: string }> = {
  // String IDs
  fox: { row: 0, col: 0, name: 'Cáo Sáng Tạo' },
  rabbit: { row: 0, col: 1, name: 'Thỏ Nhanh Nhảu' },
  lion: { row: 0, col: 2, name: 'Sư Tử Dũng Mãnh' },
  tiger: { row: 0, col: 3, name: 'Hổ Tinh Nghịch' },
  panda: { row: 1, col: 0, name: 'Gấu Trúc Đáng Yêu' },
  'brown-bear': { row: 1, col: 1, name: 'Gấu Mập Mạp' },
  squirrel: { row: 1, col: 2, name: 'Sóc Nhanh Trí' },
  koala: { row: 1, col: 3, name: 'Koala Ngoan Ngoãn' },
  unicorn: { row: 2, col: 0, name: 'Kỳ Lân Nhiệm Màu' },
  dinosaur: { row: 2, col: 1, name: 'Khủng Long Nhỏ' },
  frog: { row: 2, col: 2, name: 'Ếch Xanh Vui Vẻ' },
  penguin: { row: 2, col: 3, name: 'Chim Cánh Cụt' },

  // Emoji fallbacks
  '🦊': { row: 0, col: 0, name: 'Cáo Sáng Tạo' },
  '🐰': { row: 0, col: 1, name: 'Thỏ Nhanh Nhảu' },
  '🦁': { row: 0, col: 2, name: 'Sư Tử Dũng Mãnh' },
  '🐯': { row: 0, col: 3, name: 'Hổ Tinh Nghịch' },
  '🐼': { row: 1, col: 0, name: 'Gấu Trúc Đáng Yêu' },
  '🐻': { row: 1, col: 1, name: 'Gấu Mập Mạp' },
  '🐿️': { row: 1, col: 2, name: 'Sóc Nhanh Trí' },
  '🐨': { row: 1, col: 3, name: 'Koala Ngoan Ngoãn' },
  '🦄': { row: 2, col: 0, name: 'Kỳ Lân Nhiệm Màu' },
  '🦖': { row: 2, col: 1, name: 'Khủng Long Nhỏ' },
  '🐸': { row: 2, col: 2, name: 'Ếch Xanh Vui Vẻ' },
  '🐧': { row: 2, col: 3, name: 'Chim Cánh Cụt' }
};

export default function Avatar({ avatar, className = '' }: AvatarProps) {
  const coords = AVATAR_MAP[avatar] || AVATAR_MAP['fox'];
  
  // Calculate percentage positions
  // x: col * 100 / (cols - 1) -> col * (100 / 3) = col * 33.3333%
  // y: row * 100 / (rows - 1) -> row * (100 / 2) = row * 50%
  const posX = `${(coords.col * 100) / 3}%`;
  const posY = `${(coords.row * 100) / 2}%`;

  return (
    <div
      className={`inline-block aspect-square overflow-hidden bg-no-repeat bg-center ${className}`}
      style={{
        backgroundImage: `url(${avatarSpriteSheet})`,
        backgroundSize: '400% 300%',
        backgroundPosition: `${posX} ${posY}`,
      }}
      role="img"
      aria-label={coords.name}
    />
  );
}
