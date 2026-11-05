const flagColors = ["#ff66b0", "#b81245", "#ffc2e0", "#ff2e93"];

export default function Bunting() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-4 hidden justify-center px-6 md:flex"
    >
      <svg
        viewBox="0 0 800 70"
        className="h-16 w-full max-w-5xl"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 18 Q400 28 800 18"
          stroke="#b81245"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeDasharray="4 7"
          strokeLinecap="round"
        />
        {Array.from({ length: 12 }, (_, index) => {
          const x = 26 + index * 64;
          const y = 18 + Math.sin((index / 11) * Math.PI) * 5;

          return (
            <polygon
              key={index}
              points={`${x},${y} ${x + 24},${y} ${x + 12},${y + 30}`}
              fill={flagColors[index % flagColors.length]}
              opacity="0.7"
            />
          );
        })}
      </svg>
    </div>
  );
}
