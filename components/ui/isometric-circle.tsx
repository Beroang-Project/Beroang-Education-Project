import React from 'react';

export function IsometricCircle({ 
  className, 
  color = '#4ade80', // Default green
  active = false 
}: { 
  className?: string; 
  color?: string;
  active?: boolean;
}) {
  // We can adjust the fills based on active state or color
  const topColor = active ? color : '#D9D9D9';
  const sideColorRight = active ? '#22c55e' : '#C3C3C3'; // Slightly darker
  const sideColorLeft = active ? '#16a34a' : '#AEAEAE'; // Darkest

  return (
    <svg className={className} width="205" height="132" viewBox="0 0 205 132" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom shadow / depth */}
      <path d="M153.181 60.8291C181.381 77.1103 181.381 103.507 153.181 119.789C124.981 136.07 79.2603 136.07 51.0604 119.789C22.8605 103.507 22.8605 77.1103 51.0604 60.8291C79.2603 44.5479 124.981 44.5479 153.181 60.8291Z" fill={sideColorRight} opacity={0.6}/>
      {/* Right side */}
      <path fillRule="evenodd" clipRule="evenodd" d="M174.331 90.3093C174.331 79.6397 167.281 68.9702 153.181 60.8296C124.981 44.5483 79.2603 44.5483 51.0604 60.8296C36.9604 68.9702 29.9105 79.6397 29.9105 90.3093V58.9592C29.9105 48.2897 36.9604 37.6201 51.0604 29.4795C79.2603 13.1982 124.981 13.1982 153.181 29.4795C167.281 37.6201 174.331 48.2897 174.331 58.9592V90.3093Z" fill={sideColorRight}/>
      {/* Left side */}
      <path fillRule="evenodd" clipRule="evenodd" d="M29.9105 90.3091C29.9105 100.979 36.9604 111.648 51.0604 119.789C79.2603 136.07 124.981 136.07 153.181 119.789C167.281 111.648 174.331 100.979 174.331 90.3091V58.959C174.331 69.6286 167.281 80.2981 153.181 88.4388C124.981 104.72 79.2603 104.72 51.0604 88.4388C36.9604 80.2981 29.9105 69.6286 29.9105 58.959V90.3091Z" fill={sideColorLeft}/>
      {/* Top face */}
      <circle cx="58.9595" cy="58.9595" r="58.9595" transform="matrix(0.866025 -0.5 0.866025 0.5 0 58.96)" fill={topColor}/>
    </svg>
  );
}
