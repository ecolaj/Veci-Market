import { DetailedHTMLProps, HTMLAttributes } from 'react';

export default function AppLogo(props: DetailedHTMLProps<HTMLAttributes<SVGSVGElement>, SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background shape */}
      <rect x="5" y="5" width="90" height="90" rx="20" fill="white" />
      
      {/* Speed lines */}
      <path d="M 20 40 L 35 40" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
      <path d="M 12 50 L 30 50" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
      <path d="M 20 60 L 35 60" stroke="#373567" strokeWidth="6" strokeLinecap="round" />
      
      {/* Handle */}
      <circle cx="28" cy="28" r="5" fill="#E8483B" />
      
      {/* Cart frame */}
      <path d="M 30 30 L 85 30 L 78 65 L 38 65 L 30 30 Z" stroke="#373567" strokeWidth="6" strokeLinejoin="round" fill="white" />
      
      {/* Cart inner lines (grid) */}
      <path d="M 45 30 L 43 65" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
      <path d="M 60 30 L 58 65" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
      <path d="M 75 30 L 73 65" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
      
      <path d="M 35 42 L 82 42" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
      <path d="M 37 54 L 80 54" stroke="#373567" strokeWidth="4" strokeLinecap="round" />
      
      {/* Wheels */}
      <circle cx="45" cy="78" r="6" stroke="#373567" strokeWidth="4" fill="#6985C1" />
      <circle cx="70" cy="78" r="6" stroke="#373567" strokeWidth="4" fill="#6985C1" />
      
      {/* Cart base frame to wheel */}
      <path d="M 38 65 L 45 78" stroke="#373567" strokeWidth="5" strokeLinecap="round" />
      <path d="M 78 65 L 70 78" stroke="#373567" strokeWidth="5" strokeLinecap="round" />
      
      <path d="M 45 72 L 70 72" stroke="#373567" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
