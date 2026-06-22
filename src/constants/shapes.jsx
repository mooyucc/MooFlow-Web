import React from 'react';

export const SHAPES = [
  { type: 'roundRect', name: 'shape_roundRect', icon: <svg width="28" height="20"><rect x="3" y="3" width="22" height="14" rx="5" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'rect', name: 'shape_rect', icon: <svg width="28" height="20"><rect x="3" y="3" width="22" height="14" rx="0" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'ellipse', name: 'shape_ellipse', icon: <svg width="28" height="20"><ellipse cx="14" cy="10" rx="11" ry="7" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'circle', name: 'shape_circle', icon: <svg width="28" height="20"><ellipse cx="14" cy="10" rx="8" ry="8" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'diamond', name: 'shape_diamond', icon: <svg width="28" height="20"><polygon points="14,3 24,10 14,17 4,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'parallelogram', name: 'shape_parallelogram', icon: <svg width="28" height="20"><polygon points="7,3 24,3 20,17 3,17" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'hexagon', name: 'shape_hexagon', icon: <svg width="28" height="20"><polygon points="7,3 21,3 24,10 21,17 7,17 4,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'pentagon', name: 'shape_pentagon', icon: <svg width="28" height="20"><polygon points="14,2 21.6,7.5 18.7,16.5 9.3,16.5 6.4,7.5" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'trapezoid', name: 'shape_trapezoid', icon: <svg width="28" height="20"><polygon points="8,3 20,3 24,17 4,17" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'document', name: 'shape_document', icon: <svg width="28" height="20"><path d="M5,5 H23 Q24,5 24,8 V14 Q24,17 21,17 H7 Q5,17 5,14 V8 Q5,5 8,5 Z" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'flag', name: 'shape_flag', icon: <svg width="28" height="20"><path d="M5,5 L23,5 L20,10 L23,15 L5,15 Z" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'arrowRight', name: 'shape_arrowRight', icon: <svg width="28" height="20"><polygon points="5,10 17,10 17,6 24,10 17,14 17,10 5,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'arrowLeft', name: 'shape_arrowLeft', icon: <svg width="28" height="20"><polygon points="23,10 11,10 11,6 4,10 11,14 11,10 23,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'doubleArrow', name: 'shape_doubleArrow', icon: <svg width="28" height="20"><polygon points="4,10 8,6 8,9 20,9 20,6 24,10 20,14 20,11 8,11 8,14 4,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
];
