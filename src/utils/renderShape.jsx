import React from 'react';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants/nodeLayout';

export function renderShape(shape, props) {
  switch (shape) {
    case 'roundRect':
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={18} {...props} />;
    case 'rect':
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={0} {...props} />;
    case 'circle':
      return <ellipse cx={NODE_WIDTH / 2} cy={NODE_HEIGHT / 2} rx={NODE_HEIGHT / 2} ry={NODE_HEIGHT / 2} {...props} />;
    case 'ellipse':
      return <ellipse cx={NODE_WIDTH / 2} cy={NODE_HEIGHT / 2} rx={NODE_WIDTH / 2} ry={NODE_HEIGHT / 2} {...props} />;
    case 'diamond':
      return <polygon points="90,0 180,36 90,72 0,36" {...props} />;
    case 'parallelogram':
      return <polygon points="36,0 180,0 144,72 0,72" {...props} />;
    case 'hexagon':
      return <polygon points="45,0 135,0 180,36 135,72 45,72 0,36" {...props} />;
    case 'pentagon':
      return <polygon points="90,-36 165.4,18.6 136.6,108 43.4,108 14.6,18.6" {...props} />;
    case 'trapezoid':
      return <polygon points="36,0 144,0 180,72 0,72" {...props} />;
    case 'document':
      return <path d="M8,8 H172 Q180,8 180,24 V56 Q180,72 164,72 H16 Q8,72 8,56 V24 Q8,8 24,8 Z" {...props} />;
    case 'cloud':
      return <path d="M50,60 Q30,60 30,40 Q10,40 20,25 Q20,10 40,15 Q50,0 70,10 Q90,0 100,15 Q120,10 120,25 Q130,40 110,40 Q110,60 90,60 Q80,70 70,60 Q60,70 50,60 Z" transform="scale(1.5 1.1) translate(10,5)" {...props} />;
    case 'flag':
      return <path d="M20,10 L160,10 L140,40 L160,70 L20,70 Z" {...props} />;
    case 'arrowRight':
      return <polygon points="20,31 140,31 140,21 180,36 140,51 140,41 20,41" {...props} />;
    case 'arrowLeft':
      return <polygon points="160,31 40,31 40,21 0,36 40,51 40,41 160,41" {...props} />;
    case 'doubleArrow':
      return <polygon points="0,36 40,16 40,30 140,30 140,16 180,36 140,56 140,42 40,42 40,56 0,36" {...props} />;
    case 'star':
      return <polygon points="90,10 105,60 180,60 120,90 140,150 90,110 40,150 60,90 0,60 75,60" {...props} />;
    case 'heart':
      return <path d="M90,72 Q0,24 45,0 Q90,24 135,0 Q180,24 90,72 Z" {...props} />;
    case 'quote':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>""</text></g>;
    case 'brace':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>{}</text></g>;
    case 'bracket':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>[ ]</text></g>;
    case 'parenthesis':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>( )</text></g>;
    default:
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={18} {...props} />;
  }
}
