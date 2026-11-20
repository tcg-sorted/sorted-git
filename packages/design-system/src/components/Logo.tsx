const MONOGRAM_PATHS = [
  'M21.4763 14.5709C24.7002 19.5967 21.7086 25.3265 16.19 26.685C12.5861 27.5789 8.65832 27.0017 4.96989 27.1636L6.6311 22.3912C9.8268 21.8422 16.7532 23.5738 18.3581 19.7727C19.0971 18.013 18.703 16.0772 17.5978 14.5638H21.4693L21.4763 14.5709Z',
  'M10.5237 17.4285C8.77097 14.5918 8.63019 11.3538 10.7208 8.64382C14.6274 3.57575 21.42 5.06801 27.0301 4.83572L25.3689 9.60816C22.2295 10.129 15.2187 8.48192 13.6419 12.2267C12.9029 13.9864 13.297 15.9151 14.4022 17.4355H10.5307L10.5237 17.4285Z',
];

const KEYFRAMES = `@keyframes sorted-draw { 0% { stroke-dashoffset: 1; stroke-opacity: 1; fill-opacity: 0; } 65% { stroke-dashoffset: 0; stroke-opacity: 1; fill-opacity: 0; } 100% { stroke-dashoffset: 0; stroke-opacity: 0; fill-opacity: 1; } }
@keyframes sorted-draw-loop { 0% { stroke-dashoffset: 1; stroke-opacity: 1; fill-opacity: 0; opacity: 1; } 45% { stroke-dashoffset: 0; stroke-opacity: 1; fill-opacity: 0; opacity: 1; } 60% { stroke-dashoffset: 0; stroke-opacity: 0; fill-opacity: 1; opacity: 1; } 85% { stroke-dashoffset: 0; stroke-opacity: 0; fill-opacity: 1; opacity: 1; } 100% { stroke-dashoffset: 0; stroke-opacity: 0; fill-opacity: 1; opacity: 0; } }`;

export function Logo({
  size = 32,
  className,
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean | 'loop';
}) {
  const loop = animated === 'loop';
  const draw = animated
    ? {
        strokeDasharray: 1,
        strokeOpacity: 0,
        animation: loop
          ? 'sorted-draw-loop 2.6s cubic-bezier(0.6, 0, 0.2, 1) infinite'
          : 'sorted-draw 1.6s cubic-bezier(0.6, 0, 0.2, 1) both',
      }
    : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="Sorted Git"
    >
      {animated && <style>{KEYFRAMES}</style>}
      <g
        fill="currentColor"
        stroke={animated ? 'currentColor' : undefined}
        strokeWidth={animated ? 0.6 : undefined}
        strokeLinejoin="round"
        style={draw}
      >
        {MONOGRAM_PATHS.map((d) => (
          <path key={d} d={d} pathLength={animated ? 1 : undefined} />
        ))}
      </g>
    </svg>
  );
}
