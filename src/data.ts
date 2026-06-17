import { Level, Badge, KeyboardKey, LeaderboardEntry } from './types';

export const LEVEL_CATEGORIES = {
  'home-row': '🌸 Hàng Phím Cơ Sở',
  'all-rows': '🚀 Chinh Phục Bàn Phím',
  'vietnamese': '🇻🇳 Tiếng Việt',
  'typing-challenge': '🎮 Thử Thách Gõ Phím'
};

export const LEVELS: Level[] = [
  {
    id: 'lvl-1',
    name: 'Khởi đầu vui vẻ',
    description: 'Tập gõ các phím cơ sở bên tay trái và phải: F, J, D, K',
    category: 'home-row',
    targetItems: ['f', 'j', 'd', 'k', 'fd', 'jk', 'df', 'kj', 'fjd', 'kjd', 'ffjj', 'ddkk', 'fjdk', 'kdjf'],
    icon: 'party-popper',
    bgGradient: 'from-[#F8D77A] to-[#FFD966]',
    badgeToUnlock: 'badge-1'
  },
  {
    id: 'lvl-2',
    name: 'Hàng phím cơ sở thần kỳ',
    description: 'Luyện tập đầy đủ hàng phím cơ sở: A, S, D, F, J, K, L, Semicolon (;)',
    category: 'home-row',
    targetItems: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'asdf', 'jkl;', 'as', 'df', 'jk', 'l;', 'fads', 'klas', 'asdfjkl;'],
    icon: 'home',
    bgGradient: 'from-[#FFD966] to-[#FFC30B]',
    badgeToUnlock: 'badge-2'
  },
  {
    id: 'lvl-3',
    name: 'Bay cao hàng phím trên',
    description: 'Chinh phục các phím ở hàng trên: Q, W, E, R, T, Y, U, I, O, P',
    category: 'all-rows',
    targetItems: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ru', 'ei', 'wo', 'qp', 'ty', 'write', 'your', 'toy', 'tree', 'power'],
    icon: 'rocket',
    bgGradient: 'from-[#7DC7FF] to-[#5DB8FF]',
  },
  {
    id: 'lvl-4',
    name: 'Khám phá hàng phím dưới',
    description: 'Luyện tập gõ các phím ở hàng dưới: Z, X, C, V, B, N, M',
    category: 'all-rows',
    targetItems: [
      'z', 'x', 'c', 'v', 'b', 'n', 'm', 'zxcv', 'vbnm', 'cx', 'zb',
      'nice', 'box', 'zero', 'moon', 'voice', 'music', 'zone',
      'van', 'bus', 'net', 'map', 'zoo', 'fox', 'car', 'cow',
      'cat', 'dog', 'banana', 'monkey', 'zebra', 'pencil',
      'window', 'yellow', 'crayon', 'balloon', 'rabbit', 'summer'
    ],
    icon: 'compass',
    bgGradient: 'from-[#5DB8FF] to-[#3DA5F0]',
  },
  {
    id: 'lvl-5',
    name: 'Liên minh ba hàng phím',
    description: 'Kết hợp linh hoạt cả ba hàng phím chữ cơ bản thành các từ đáng yêu',
    category: 'all-rows',
    targetItems: [
      'cat', 'dog', 'sun', 'bee', 'fish', 'bird', 'lion', 'jump',
      'sweet', 'happy', 'typing', 'funny', 'kid', 'smile', 'flower',
      'apple', 'orange', 'grapes', 'monkey', 'rabbit', 'turtle',
      'pencil', 'ruler', 'school', 'friend', 'family', 'house',
      'garden', 'star', 'cloud', 'rainbow', 'bubble', 'cookie',
      'candy', 'butter', 'cheese', 'bread', 'water', 'bottle', 'guitar'
    ],
    icon: 'puzzle',
    bgGradient: 'from-[#3DA5F0] to-[#2E94E0]',
    badgeToUnlock: 'badge-3'
  },
  {
    id: 'lvl-6',
    name: 'Phép Thuật Dấu Việt',
    description: 'Tập gõ các chữ cái tiếng Việt có dấu cơ bản đ, ă, â, ê, ô, ơ, ư và các dấu thanh',
    category: 'vietnamese',
    targetItems: ['đ', 'ă', 'â', 'ê', 'ô', 'ơ', 'ư', 'á', 'à', 'ả', 'ã', 'ạ', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'í', 'ì', 'ỉ', 'ĩ', 'ị', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],
    helperTips: {
      'đ': 'Telex: dd | VNI: d9',
      'ă': 'Telex: aw | VNI: a8',
      'â': 'Telex: aa | VNI: a6',
      'ê': 'Telex: ee | VNI: e6',
      'ô': 'Telex: oo | VNI: o6',
      'ơ': 'Telex: ow | VNI: o7',
      'ư': 'Telex: uw | VNI: u7',
      'á': 'Telex: as | VNI: a1',
      'à': 'Telex: af | VNI: a2',
      'ả': 'Telex: ar | VNI: a3',
      'ã': 'Telex: ax | VNI: a4',
      'ạ': 'Telex: aj | VNI: a5',
      'ấ': 'Telex: aas | VNI: a61',
      'ầ': 'Telex: aaf | VNI: a62',
      'ẩ': 'Telex: aar | VNI: a63',
      'ẫ': 'Telex: aax | VNI: a64',
      'ậ': 'Telex: aaj | VNI: a65',
      'ắ': 'Telex: aws | VNI: a81',
      'ằ': 'Telex: awf | VNI: a82',
      'ẳ': 'Telex: awr | VNI: a83',
      'ẵ': 'Telex: awx | VNI: a84',
      'ặ': 'Telex: awj | VNI: a85',
      'ế': 'Telex: ees | VNI: e61',
      'ề': 'Telex: eef | VNI: e62',
      'ể': 'Telex: eer | VNI: e63',
      'ễ': 'Telex: eex | VNI: e64',
      'ệ': 'Telex: eej | VNI: e65',
      'ố': 'Telex: oos | VNI: o61',
      'ồ': 'Telex: oof | VNI: o62',
      'ổ': 'Telex: oor | VNI: o63',
      'ỗ': 'Telex: oox | VNI: o64',
      'ộ': 'Telex: ooj | VNI: o65',
      'ớ': 'Telex: ows | VNI: o71',
      'ờ': 'Telex: owf | VNI: o72',
      'ở': 'Telex: owr | VNI: o73',
      'ỡ': 'Telex: owx | VNI: o74',
      'ợ': 'Telex: owj | VNI: o75',
      'ứ': 'Telex: uws | VNI: u71',
      'ừ': 'Telex: uwf | VNI: u72',
      'ử': 'Telex: uwr | VNI: u73',
      'ữ': 'Telex: uwx | VNI: u74',
      'ự': 'Telex: uwj | VNI: u75',
      'í': 'Telex: is | VNI: i1',
      'ì': 'Telex: if | VNI: i2',
      'ỉ': 'Telex: ir | VNI: i3',
      'ĩ': 'Telex: ix | VNI: i4',
      'ị': 'Telex: ij | VNI: i5',
      'ó': 'Telex: os | VNI: o1',
      'ò': 'Telex: of | VNI: o2',
      'ỏ': 'Telex: or | VNI: o3',
      'õ': 'Telex: ox | VNI: o4',
      'ọ': 'Telex: oj | VNI: o5',
      'ú': 'Telex: us | VNI: u1',
      'ù': 'Telex: uf | VNI: u2',
      'ủ': 'Telex: ur | VNI: u3',
      'ũ': 'Telex: ux | VNI: u4',
      'ụ': 'Telex: uj | VNI: u5',
      'ý': 'Telex: ys | VNI: y1',
      'ỳ': 'Telex: yf | VNI: y2',
      'ỷ': 'Telex: yr | VNI: y3',
      'ỹ': 'Telex: yx | VNI: y4',
      'ỵ': 'Telex: yj | VNI: y5'
    },
    icon: 'wand-2',
    bgGradient: 'from-[#9BE38F] to-[#8AD67F]',
    badgeToUnlock: 'badge-4'
  },
  {
    id: 'lvl-7',
    name: 'Xưởng Ghép Từ Diệu Kỳ',
    description: 'Tập gõ từ tiếng Việt ngắn có dấu thanh: sắc, huyền, hỏi, ngã, nặng',
    category: 'vietnamese',
    targetItems: ['bố', 'mẹ', 'bé', 'cá', 'mèo', 'chó', 'lá', 'bóng', 'hoa', 'sách', 'vở', 'nhà', 'học', 'chuối', 'quả'],
    helperTips: {
      'bố': 'Telex: b-o-o-s | VNI: b-o-6-1',
      'mẹ': 'Telex: m-e-j | VNI: m-e-5',
      'bé': 'Telex: b-e-s | VNI: b-e-1',
      'cá': 'Telex: c-a-s | VNI: c-a-1',
      'mèo': 'Telex: m-e-o-f | VNI: m-e-o-2',
      'chó': 'Telex: c-h-o-s | VNI: c-h-o-1',
      'lá': 'Telex: l-a-s | VNI: l-a-1',
      'bóng': 'Telex: b-o-n-g-s | VNI: b-o-n-g-1',
      'hoa': 'Telex: h-o-a | VNI: h-o-a',
      'sách': 'Telex: s-a-c-h-s | VNI: s-a-c-h-1',
      'vở': 'Telex: v-o-r | VNI: v-o-7-3 (hoặc v-o-w-r)',
      'nhà': 'Telex: n-h-a-f | VNI: n-h-a-2',
      'học': 'Telex: h-o-c-j | VNI: h-o-c-5',
      'chuối': 'Telex: c-h-u-o-i-s | VNI: c-h-u-o-o-i-s-z',
      'quả': 'Telex: q-u-a-r | VNI: q-u-a-3'
    },
    icon: 'book-open',
    bgGradient: 'from-[#8AD67F] to-[#7BC96F]',
  },
  {
    id: 'lvl-8',
    name: 'Nhà Văn Tí Hon Kể Chuyện',
    description: 'Thử thách gõ những câu tiếng Việt ngắn có nghĩa thật vui nhộn',
    category: 'vietnamese',
    targetItems: [
      'Bé yêu bố mẹ nhiều lắm.',
      'Sách vở là bạn tốt của em.',
      'Chú chim nhỏ hót líu lo.',
      'Mèo con đang ngủ say sưa.',
      'Em chăm chỉ luyện gõ phím.'
    ],
    icon: 'message-square-text',
    bgGradient: 'from-[#7BC96F] to-[#6CBC5F]',
    badgeToUnlock: 'badge-5'
  },
  {
    id: 'lvl-9',
    name: 'Tập Gõ Văn Bản Của Em',
    description: 'Nhập đoạn văn em muốn và bắt đầu luyện gõ!',
    category: 'typing-challenge',
    targetItems: [],
    icon: 'keyboard',
    bgGradient: 'from-[#C79CFF] to-[#B78CF0]',
  },
  {
    id: 'lvl-10',
    name: 'Bubble Race',
    description: 'Thử thách đặc biệt gõ các từ rơi tự do trong bong bóng để ghi thật nhiều điểm',
    category: 'typing-challenge',
    targetItems: [
      'mặt trời', 'đám mây', 'vòng quay', 'kem bơ', 'kẹo ngọt', 'vương quốc', 'sóng biển',
      'khủng long', 'bút chì', 'ước mơ', 'quả dứa', 'con mèo', 'chú chó', 'con cá',
      'hoa sen', 'bóng bay', 'ông trăng', 'ngôi sao', 'cơn mưa', 'cầu vồng', 'gấu con',
      'bồ câu', 'cây xanh', 'bánh ngọt', 'kẹo dẻo', 'búp bê', 'xe đạp', 'bút màu', 'vở vẽ'
    ],
    icon: 'waves',
    bgGradient: 'from-[#B78CF0] to-[#A77CE0]',
    badgeToUnlock: 'badge-6'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'Khởi Động Tự Tin 🎽',
    description: 'Hoàn thành cấp độ gõ cơ sở đầu tiên',
    emoji: '🎖️',
    color: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    condition: 'Hoàn thành Cấp độ 1'
  },
  {
    id: 'badge-2',
    title: 'Kiệt Tướng Hàng Cơ Sở 🏠',
    description: 'Gõ thành thạo tất cả phím tại hàng cơ sở',
    emoji: '👑',
    color: 'bg-orange-100 border-orange-400 text-orange-700',
    condition: 'Hoàn thành Cấp độ 2'
  },
  {
    id: 'badge-3',
    title: 'Phù Thủy Ba Hàng Phím 🔮',
    description: 'Gõ trôi chảy các ký tự không dấu ở cả 3 hàng phím',
    emoji: '🧙‍♂️',
    color: 'bg-purple-100 border-purple-400 text-purple-700',
    condition: 'Hoàn thành Cấp độ 5'
  },
  {
    id: 'badge-4',
    title: 'Anh Hùng Gõ Tiếng Việt 🇻🇳',
    description: 'Xuất sắc chinh phục các chữ cái tiếng Việt có dấu đặc biệt',
    emoji: '🛡️',
    color: 'bg-red-100 border-red-400 text-red-700',
    condition: 'Hoàn thành Cấp độ 6'
  },
  {
    id: 'badge-5',
    title: 'Đôi Tay Vàng Bé Ngoan ✍️',
    description: 'Gõ thành công những câu tiếng việt dài đầy đủ sắc thái',
    emoji: '🏆',
    color: 'bg-blue-100 border-blue-400 text-blue-700',
    condition: 'Hoàn thành Cấp độ 8'
  },
  {
    id: 'badge-6',
    title: 'Chiến Thần Bong Bóng 🧼',
    description: 'Đạt thành tích xuất sắc tại đấu trường bong bóng tốc độ',
    emoji: '⚡',
    color: 'bg-pink-100 border-pink-400 text-pink-700',
    condition: 'Hoàn thành Cấp độ 10'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'npc-1', name: 'Sóc Nhanh Trí 🐿️', avatar: 'squirrel', score: 3250, wpm: 48, accuracy: 98, isNpc: true },
  { id: 'npc-2', name: 'Thỏ Gõ Nhanh 🐰', avatar: 'rabbit', score: 2800, wpm: 42, accuracy: 96, isNpc: true },
  { id: 'npc-3', name: 'Gấu Chăm Chỉ 🐻', avatar: 'brown-bear', score: 2100, wpm: 31, accuracy: 94, isNpc: true },
  { id: 'npc-4', name: 'Gấu Trúc Đáng Yêu 🐼', avatar: 'panda', score: 1550, wpm: 24, accuracy: 91, isNpc: true },
  { id: 'npc-5', name: 'Ếch Xanh Vui Vẻ 🐸', avatar: 'frog', score: 980, wpm: 15, accuracy: 88, isNpc: true }
];

export const KEYBOARD_KEYS: KeyboardKey[] = [
  // Numbers row
  { key: '`', display: '` ~', finger: 'left-pinky', row: 'number' },
  { key: '1', display: '1', finger: 'left-pinky', row: 'number' },
  { key: '2', display: '2', finger: 'left-ring', row: 'number' },
  { key: '3', display: '3', finger: 'left-middle', row: 'number' },
  { key: '4', display: '4', finger: 'left-index', row: 'number' },
  { key: '5', display: '5', finger: 'left-index', row: 'number' },
  { key: '6', display: '6', finger: 'right-index', row: 'number' },
  { key: '7', display: '7', finger: 'right-index', row: 'number' },
  { key: '8', display: '8', finger: 'right-middle', row: 'number' },
  { key: '9', display: '9', finger: 'right-ring', row: 'number' },
  { key: '0', display: '0', finger: 'right-pinky', row: 'number' },
  { key: '-', display: '-', finger: 'right-pinky', row: 'number' },
  { key: '=', display: '=', finger: 'right-pinky', row: 'number' },
  { key: 'backspace', display: '⌫', finger: 'right-pinky', row: 'number' },

  // Top letter row
  { key: 'tab', display: 'Tab ⇥', finger: 'left-pinky', row: 'top' },
  { key: 'q', display: 'Q', finger: 'left-pinky', row: 'top' },
  { key: 'w', display: 'W', finger: 'left-ring', row: 'top' },
  { key: 'e', display: 'E', finger: 'left-middle', row: 'top' },
  { key: 'r', display: 'R', finger: 'left-index', row: 'top' },
  { key: 't', display: 'T', finger: 'left-index', row: 'top' },
  { key: 'y', display: 'Y', finger: 'right-index', row: 'top' },
  { key: 'u', display: 'U', finger: 'right-index', row: 'top' },
  { key: 'i', display: 'I', finger: 'right-middle', row: 'top' },
  { key: 'o', display: 'O', finger: 'right-ring', row: 'top' },
  { key: 'p', display: 'P', finger: 'right-pinky', row: 'top' },
  { key: '[', display: '[ {', finger: 'right-pinky', row: 'top' },
  { key: ']', display: '] }', finger: 'right-pinky', row: 'top' },
  { key: '\\', display: '\\ |', finger: 'right-pinky', row: 'top' },

  // Home row
  { key: 'capslock', display: 'Caps ⇪', finger: 'left-pinky', row: 'home' },
  { key: 'a', display: 'A', finger: 'left-pinky', row: 'home' },
  { key: 's', display: 'S', finger: 'left-ring', row: 'home' },
  { key: 'd', display: 'D', finger: 'left-middle', row: 'home' },
  { key: 'f', display: 'F', finger: 'left-index', row: 'home' },
  { key: 'g', display: 'G', finger: 'left-index', row: 'home' },
  { key: 'h', display: 'H', finger: 'right-index', row: 'home' },
  { key: 'j', display: 'J', finger: 'right-index', row: 'home' },
  { key: 'k', display: 'K', finger: 'right-middle', row: 'home' },
  { key: 'l', display: 'L', finger: 'right-ring', row: 'home' },
  { key: ';', display: '; :', finger: 'right-pinky', row: 'home' },
  { key: '\'', display: '\' "', finger: 'right-pinky', row: 'home' },
  { key: 'enter', display: 'Enter ↵', finger: 'right-pinky', row: 'home' },

  // Bottom row
  { key: 'shift-left', display: 'Shift ⇧', finger: 'left-pinky', row: 'bottom' },
  { key: 'z', display: 'Z', finger: 'left-pinky', row: 'bottom' },
  { key: 'x', display: 'X', finger: 'left-ring', row: 'bottom' },
  { key: 'c', display: 'C', finger: 'left-middle', row: 'bottom' },
  { key: 'v', display: 'V', finger: 'left-index', row: 'bottom' },
  { key: 'b', display: 'B', finger: 'left-index', row: 'bottom' },
  { key: 'n', display: 'N', finger: 'right-index', row: 'bottom' },
  { key: 'm', display: 'M', finger: 'right-index', row: 'bottom' },
  { key: ',', display: ', <', finger: 'right-middle', row: 'bottom' },
  { key: '.', display: '. >', finger: 'right-ring', row: 'bottom' },
  { key: '/', display: '/ ?', finger: 'right-pinky', row: 'bottom' },
  { key: 'shift-right', display: 'Shift ⇧', finger: 'right-pinky', row: 'bottom' },

  // Space row
  { key: 'space', display: '⏱️ (Khoảng Trắng)', finger: 'thumb', row: 'space' }
];

export const FINGER_COLORS = {
  'left-pinky': { bg: 'bg-rose-100 dark:bg-rose-950', border: 'border-rose-400', text: 'text-rose-600', hover: 'hover:bg-rose-200' },
  'left-ring': { bg: 'bg-pink-100 dark:bg-pink-950', border: 'border-pink-400', text: 'text-pink-600', hover: 'hover:bg-pink-200' },
  'left-middle': { bg: 'bg-amber-100 dark:bg-amber-950', border: 'border-amber-400', text: 'text-amber-600', hover: 'hover:bg-amber-200' },
  'left-index': { bg: 'bg-yellow-100 dark:bg-yellow-950', border: 'border-yellow-400', text: 'text-yellow-600', hover: 'hover:bg-yellow-200' },
  'thumb': { bg: 'bg-emerald-100 dark:bg-emerald-950', border: 'border-emerald-400', text: 'text-emerald-600', hover: 'hover:bg-emerald-200' },
  'right-index': { bg: 'bg-sky-100 dark:bg-sky-950', border: 'border-sky-400', text: 'text-sky-600', hover: 'hover:bg-sky-200' },
  'right-middle': { bg: 'bg-blue-100 dark:bg-blue-950', border: 'border-blue-400', text: 'text-blue-600', hover: 'hover:bg-blue-200' },
  'right-ring': { bg: 'bg-indigo-100 dark:bg-indigo-950', border: 'border-indigo-400', text: 'text-indigo-600', hover: 'hover:bg-indigo-200' },
  'right-pinky': { bg: 'bg-violet-100 dark:bg-violet-950', border: 'border-violet-400', text: 'text-violet-600', hover: 'hover:bg-violet-200' },
};
