import React, { useState } from 'react';

const Logo360 = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex justify-center items-center mb-8">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ perspective: '1000px' }}
      >
        {/* Logo Container with 3D Transform */}
        <div
          className="relative w-40 h-40 transition-all duration-1000 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovered ? 'rotateY(360deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side - Logo */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0px)',
            }}
          >
            {/* Escudo de Bomberos Voluntarios */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Cruz de Malta (Símbolo de Bomberos) */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="drop-shadow-lg"
              >
                {/* Cruz de Malta */}
                <g transform="translate(60,60)">
                  {/* Brazos de la cruz */}
                  {[0, 90, 180, 270].map((rotation, index) => (
                    <g key={index} transform={`rotate(${rotation})`}>
                      <path
                        d="M 0,-25 L -8,-15 L -3,-15 L -3,0 L 3,0 L 3,-15 L 8,-15 Z"
                        fill="white"
                        stroke="gold"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Centro de la cruz */}
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="#1e40af"
                    stroke="gold"
                    strokeWidth="2"
                  />

                  {/* Número 123 (Bomberos Voluntarios) */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="white"
                  >
                    123
                  </text>
                </g>

                {/* Anillo exterior */}
                <circle
                  cx="60"
                  cy="60"
                  r="57"
                  fill="none"
                  stroke="gold"
                  strokeWidth="2"
                />
              </svg>

              {/* Efecto de brillo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
          </div>

          {/* Back Side - Text */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center text-white px-4">
              <div className="text-2xl font-bold mb-1">BVG</div>
              <div className="text-xs font-medium">Bomberos Voluntarios</div>
              <div className="text-xs font-medium">de Guatemala</div>
            </div>
          </div>
        </div>

        {/* Sombra animada */}
        <div
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black/20 rounded-full blur-xl transition-all duration-1000"
          style={{
            opacity: isHovered ? 0.3 : 0.5,
            transform: isHovered
              ? 'translateX(-50%) scale(0.8)'
              : 'translateX(-50%) scale(1)',
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Logo360;
