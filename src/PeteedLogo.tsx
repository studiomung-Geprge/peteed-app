interface PeteedLogoProps {
  size?: number
  showTagline?: boolean
}

export default function PeteedLogo({ size = 160, showTagline = false }: PeteedLogoProps) {
  const scale = size / 400
  const height = showTagline ? size : size * 0.7
  return (
    <svg
      width={size}
      height={height}
      viewBox={showTagline ? '0 0 400 300' : '0 0 400 210'}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* wordmark */}
      <text
        x="200" y="175"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="64"
        fontWeight="700"
        fill="#1C1C1A"
        textAnchor="middle"
        letterSpacing="-2"
      >
        pet<tspan fill="#FF6B4A">eed</tspan>
      </text>

      {/* underline arc */}
      <path
        d="M100,198 Q200,214 300,198"
        fill="none"
        stroke="#1C1C1A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.15"
      />

      {/* tagline */}
      {showTagline && (
        <text
          x="200" y="244"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          fill="#8A8A82"
          textAnchor="middle"
          letterSpacing="3"
        >
          TRUSTED PET NETWORK
        </text>
      )}
    </svg>
  )
}
