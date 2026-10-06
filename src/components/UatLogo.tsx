import React from 'react';

export type UatLogoVariant =
  | 'corporate'     // Logo oficial moderno UAT con letras estilizadas y tipografía (Imagen 1)
  | 'seal'          // Escudo heráldico circular oficial con antorcha, átomo y lema (Imagen 2)
  | 'horizontal'    // Logo moderno UAT + texto "Sistema Institucional de Tutorías"
  | 'compact'       // Isotipo moderno UAT compacto para barras superiores o móviles
  | 'shield'        // Escudo heráldico compacto con lema para perfiles y credenciales
  | 'icon';         // Solo el monograma estilizado naranja UAT

interface UatLogoProps {
  variant?: UatLogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  textColor?: 'dark' | 'light' | 'auto';
  className?: string;
  showSubtitle?: boolean;
  showMotto?: boolean; // Para mostrar "VERDAD, BELLEZA, PROBIDAD"
}

/**
 * Escudo Heráldico Circular Oficial de la UAT (Imagen 2 de referencia)
 * "VNIVERSIDAD AVTONOMA Đ TAMAVLIPAS"
 * Lema: "VERDAD, BELLEZA, PROBIDAD"
 */
export const UatHeraldicSeal: React.FC<{
  size?: number | string;
  className?: string;
  textColor?: 'dark' | 'light' | 'auto';
  showMotto?: boolean;
}> = ({ size = 120, className = '', textColor = 'auto', showMotto = true }) => {
  const strokeColor =
    textColor === 'light'
      ? '#F8FAFC'
      : textColor === 'dark'
      ? '#1E293B'
      : 'currentColor';

  const mottoClass =
    textColor === 'light'
      ? 'text-slate-100'
      : textColor === 'dark'
      ? 'text-slate-900'
      : 'text-slate-800 dark:text-slate-100';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
        aria-label="Escudo Oficial de la Universidad Autónoma de Tamaulipas"
      >
        {/* Fondo sutil circular */}
        <circle cx="200" cy="200" r="190" fill="transparent" />

        {/* Anillo exterior grueso */}
        <circle
          cx="200"
          cy="200"
          r="188"
          stroke={strokeColor}
          strokeWidth="6"
        />

        {/* Anillo interior delimitador del texto */}
        <circle
          cx="200"
          cy="200"
          r="144"
          stroke={strokeColor}
          strokeWidth="3.5"
        />

        {/* Círculo base concéntrico ornamental */}
        <circle
          cx="200"
          cy="200"
          r="140"
          stroke={strokeColor}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.3"
        />

        {/* Path circular para el texto perimetral: VNIVERSIDAD AVTONOMA Đ TAMAVLIPAS */}
        <defs>
          <path
            id="uatCircularPathTop"
            d="M 68 200 A 132 132 0 1 1 332 200 A 132 132 0 0 1 68 200"
          />
          <path
            id="uatCircularPathBottom"
            d="M 62 215 A 138 138 0 0 0 338 215"
          />
        </defs>

        {/* Texto circular superior e inferior con tipografía Romana Clásica */}
        <text
          fill={strokeColor}
          fontSize="23.5"
          fontFamily="'Cinzel', 'Times New Roman', 'Baskerville', serif"
          fontWeight="700"
          letterSpacing="0.14em"
        >
          <textPath
            href="#uatCircularPathTop"
            startOffset="50%"
            textAnchor="middle"
          >
            VNIVERSIDAD AVTONOMA Đ TAMAVLIPAS
          </textPath>
        </text>

        {/* ============================================================== */}
        {/* ELEMENTOS CENTRALES DEL ESCUDO (Libro, Figura humana, Antorcha y Átomo) */}
        {/* ============================================================== */}

        {/* 1. LIBRO ABIERTO DE LA SABIDURÍA (en la base) */}
        <g id="open-book">
          {/* Páginas exteriores */}
          <path
            d="M142 278 C 172 266, 192 270, 200 274 C 208 270, 228 266, 258 278 L 262 287 C 230 275, 210 278, 200 283 C 190 278, 170 275, 138 287 Z"
            fill={strokeColor}
            fillOpacity="0.08"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Hojas superiores del libro */}
          <path
            d="M140 276 C 168 264, 188 268, 200 272 C 212 268, 232 264, 260 276"
            stroke={strokeColor}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Lomo y encuadernación */}
          <path
            d="M200 272 L200 286"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Líneas de texto simuladas en páginas */}
          <path
            d="M152 274 C 168 268, 182 270, 192 272 M150 278 C 166 272, 180 274, 190 276"
            stroke={strokeColor}
            strokeWidth="1.2"
            opacity="0.6"
          />
          <path
            d="M208 272 C 218 270, 232 268, 248 274 M210 276 C 220 274, 234 272, 250 278"
            stroke={strokeColor}
            strokeWidth="1.2"
            opacity="0.6"
          />
          <circle cx="200" cy="286" r="3.5" fill={strokeColor} />
        </g>

        {/* 2. SILUETA HUMANA ASCENDENTE (EL SER HUMANO / ESTUDIANTE) */}
        <g id="human-figure">
          {/* Cabeza del estudiante */}
          <ellipse
            cx="200"
            cy="210"
            rx="8.5"
            ry="11.5"
            stroke={strokeColor}
            strokeWidth="3"
            fill="none"
          />
          {/* Cuello y torso emergiendo del libro */}
          <path
            d="M195 222 C 190 234, 184 246, 178 258 C 188 261, 200 263, 200 270 C 200 263, 212 261, 222 258 C 216 246, 210 234, 205 222 Z"
            stroke={strokeColor}
            strokeWidth="3"
            fill={strokeColor}
            fillOpacity="0.1"
            strokeLinejoin="round"
          />
          {/* Línea pectoral y torso estilizado */}
          <path
            d="M188 238 Q 200 248 212 238"
            stroke={strokeColor}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M200 244 L 200 266"
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* 3. BRAZO IZQUIERDO ELEVADO HACIA LA ANTORCHA (Sosteniendo el fuego del saber) */}
          <path
            d="M188 232 C 172 216, 154 180, 134 148 C 138 144, 148 145, 156 160 C 168 182, 180 208, 192 226"
            stroke={strokeColor}
            strokeWidth="3"
            fill={strokeColor}
            fillOpacity="0.15"
            strokeLinecap="round"
          />
          {/* Mano izquierda sosteniendo la antorcha */}
          <path
            d="M130 148 C 132 140, 142 136, 146 142"
            stroke={strokeColor}
            strokeWidth="3"
            fill="none"
          />

          {/* 4. BRAZO DERECHO ELEVADO HACIA EL ÁTOMO (Sosteniendo la ciencia y técnica) */}
          <path
            d="M212 232 C 228 216, 246 180, 266 148 C 262 144, 252 145, 244 160 C 232 182, 220 208, 208 226"
            stroke={strokeColor}
            strokeWidth="3"
            fill={strokeColor}
            fillOpacity="0.15"
            strokeLinecap="round"
          />
          {/* Mano derecha sosteniendo el átomo */}
          <path
            d="M270 148 C 268 140, 258 136, 254 142"
            stroke={strokeColor}
            strokeWidth="3"
            fill="none"
          />
        </g>

        {/* 5. ANTORCHA DEL CONOCIMIENTO (Mano izquierda - Lado izquierdo del espectador) */}
        <g id="torch">
          {/* Mango cilíndrico estriado */}
          <path
            d="M128 140 L 140 162 M133 138 L 144 158"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Copa / pebetero de la antorcha */}
          <path
            d="M116 126 C 114 135, 122 140, 130 141 L 138 140 C 144 136, 146 130, 144 124 Z"
            stroke={strokeColor}
            strokeWidth="3"
            fill={strokeColor}
            fillOpacity="0.1"
          />
          <ellipse
            cx="130"
            cy="124"
            rx="14"
            ry="5.5"
            stroke={strokeColor}
            strokeWidth="2.5"
            fill="none"
          />
          {/* Llamas de fuego ondulantes (Flama del saber UAT) */}
          <path
            d="M120 120 C 116 106, 122 96, 116 82 C 124 90, 130 92, 132 86 C 136 78, 142 90, 144 98 C 146 106, 140 114, 138 120 Z"
            stroke={strokeColor}
            strokeWidth="3"
            fill="#EE7402"
            fillOpacity="0.25"
            strokeLinejoin="round"
          />
          <path
            d="M124 116 C 122 104, 126 98, 122 88 C 128 94, 132 98, 134 106 Z"
            stroke="#EE7402"
            strokeWidth="2"
            fill="#EE7402"
          />
        </g>

        {/* 6. MODELO ATÓMICO (Mano derecha - Lado derecho del espectador) */}
        <g id="atom">
          {/* Núcleo atómico central */}
          <circle
            cx="270"
            cy="118"
            r="6"
            fill="#EE7402"
            stroke={strokeColor}
            strokeWidth="2.5"
          />
          <circle cx="270" cy="118" r="2.5" fill="#FFFFFF" />

          {/* Órbita 1: Horizontal inclinada */}
          <ellipse
            cx="270"
            cy="118"
            rx="32"
            ry="11"
            transform="rotate(-15 270 118)"
            stroke={strokeColor}
            strokeWidth="2.2"
            fill="none"
          />
          {/* Electrón 1 */}
          <circle
            cx="298"
            cy="111"
            r="3"
            fill={strokeColor}
          />

          {/* Órbita 2: Inclinada a la derecha (+50 deg) */}
          <ellipse
            cx="270"
            cy="118"
            rx="32"
            ry="11"
            transform="rotate(50 270 118)"
            stroke={strokeColor}
            strokeWidth="2.2"
            fill="none"
          />
          {/* Electrón 2 */}
          <circle
            cx="285"
            cy="142"
            r="3"
            fill={strokeColor}
          />

          {/* Órbita 3: Inclinada a la izquierda (-55 deg) */}
          <ellipse
            cx="270"
            cy="118"
            rx="32"
            ry="11"
            transform="rotate(-55 270 118)"
            stroke={strokeColor}
            strokeWidth="2.2"
            fill="none"
          />
          {/* Electrón 3 */}
          <circle
            cx="256"
            cy="92"
            r="3"
            fill={strokeColor}
          />
        </g>
      </svg>

      {/* LEMA OFICIAL AL PIE: "VERDAD, BELLEZA, PROBIDAD" */}
      {showMotto && (
        <p
          className={`mt-2 font-serif uppercase tracking-[0.22em] text-[10.5px] font-bold text-center ${mottoClass}`}
        >
          VERDAD, BELLEZA, PROBIDAD
        </p>
      )}
    </div>
  );
};

/**
 * Logotipo Institucional Moderno de la UAT (Imagen 1 de referencia)
 * - Letras "UAT" estilizadas con degradado naranja institucional y corte de águila en la T
 * - Texto: "Universidad Autónoma de"
 * - Texto: "TAMAULIPAS"
 */
export const UatCorporateLogo: React.FC<{
  className?: string;
  textColor?: 'dark' | 'light' | 'auto';
  showSubtext?: boolean;
  scale?: number;
  badgeText?: string;
}> = ({
  className = '',
  textColor = 'auto',
  showSubtext = true,
  scale = 1,
  badgeText
}) => {
  const line1Color =
    textColor === 'light'
      ? 'text-slate-200'
      : textColor === 'dark'
      ? 'text-[#4A5568]'
      : 'text-[#4A5568] dark:text-slate-200';

  const line2Color =
    textColor === 'light'
      ? 'text-white'
      : textColor === 'dark'
      ? 'text-[#2D3748]'
      : 'text-[#2D3748] dark:text-white';

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
    >
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 340 160"
          className="w-full max-w-[210px] h-auto drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logotipo Oficial UAT"
        >
          <defs>
            {/* Degradado oficial UAT (Naranja Cálido a Cobre Intenso) */}
            <linearGradient id="uatOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F57C00" />
              <stop offset="35%" stopColor="#EE7402" />
              <stop offset="100%" stopColor="#D84A00" />
            </linearGradient>

            <linearGradient id="uatGleam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA245" />
              <stop offset="100%" stopColor="#EE7402" />
            </linearGradient>
          </defs>

          {/* ========================================================== */}
          {/* LETRA 'U' ESTILIZADA */}
          {/* ========================================================== */}
          <path
            d="M 18 20
               L 48 20
               L 48 88
               C 48 106, 62 118, 78 118
               C 94 118, 108 106, 108 88
               L 108 20
               L 138 20
               L 138 90
               C 138 126, 112 148, 78 148
               C 44 148, 18 126, 18 90
               Z"
            fill="url(#uatOrangeGradient)"
          />

          {/* Reflejo superior sutil en la U */}
          <path
            d="M 18 20 L 48 20 L 48 40 L 18 40 Z M 108 20 L 138 20 L 138 40 L 108 40 Z"
            fill="url(#uatGleam)"
            opacity="0.3"
          />

          {/* ========================================================== */}
          {/* LETRA 'A' ESTILIZADA (Vértice afilado y contraforma triangular) */}
          {/* ========================================================== */}
          <path
            d="M 194 14
               L 252 148
               L 220 148
               L 204 110
               L 162 110
               L 156 124
               L 126 148
               L 182 14
               Z
               M 174 84
               L 195 84
               L 185 58
               Z"
            fill="url(#uatOrangeGradient)"
            fillRule="evenodd"
          />

          {/* ========================================================== */}
          {/* LETRA 'T' CON SILUETA DEL ÁGUILA / ALAS UAT */}
          {/* ========================================================== */}
          {/* Travesaño superior con el corte de plumas y pico del halcón */}
          <path
            d="M 226 22
               L 316 22
               C 328 22, 336 28, 336 38
               C 336 46, 328 50, 318 52
               L 278 52
               L 278 148
               L 248 148
               L 248 52
               L 226 52
               Z"
            fill="url(#uatOrangeGradient)"
          />

          {/* Ala aerodinámica con ranura de pluma blanca característica UAT */}
          <path
            d="M 246 36
               C 278 36, 310 32, 332 26
               C 334 30, 335 34, 334 38
               C 312 44, 280 46, 246 44
               Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
        </svg>

        {badgeText && (
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide bg-amber-500/10 text-[#EE7402] border border-[#EE7402]/30">
            {badgeText}
          </span>
        )}
      </div>

      {/* Subtexto corporativo oficial UAT */}
      {showSubtext && (
        <div className="w-full text-center mt-1">
          <p
            className={`font-sans text-[11px] sm:text-[12.5px] font-normal tracking-[0.06em] leading-tight ${line1Color}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Universidad Autónoma de
          </p>
          <p
            className={`font-heading text-[15px] sm:text-[17px] font-extrabold tracking-[0.14em] leading-none uppercase ${line2Color}`}
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            TAMAULIPAS
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Componente Principal Unificado UatLogo
 * Expone variantes fáciles para el encabezado, barra lateral, tarjetas y modal de login
 */
export const UatLogo: React.FC<UatLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  textColor = 'auto',
  className = '',
  showSubtitle = true,
  showMotto = true
}) => {
  // Tamaños numéricos para el escudo heráldico
  const sealDimensions = {
    sm: 36,
    md: 48,
    lg: 72,
    xl: 96,
    '2xl': 130
  }[size];

  // ==============================================================
  // 1. VARIANTE HERÁLDICA / ESCUDO CIRCULAR OFICIAL (Imagen 2)
  // ==============================================================
  if (variant === 'seal' || variant === 'shield') {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <UatHeraldicSeal
          size={sealDimensions}
          textColor={textColor}
          showMotto={showMotto}
        />
      </div>
    );
  }

  // ==============================================================
  // 2. VARIANTE CORPORATIVA COMPLETA (Imagen 1)
  // ==============================================================
  if (variant === 'corporate') {
    return (
      <UatCorporateLogo
        className={className}
        textColor={textColor}
        showSubtext={showSubtitle}
      />
    );
  }

  // ==============================================================
  // 3. VARIANTE ICONO / MONOGRAMA
  // ==============================================================
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 340 160"
          className="w-10 h-7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="uatIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F57C00" />
              <stop offset="100%" stopColor="#D84A00" />
            </linearGradient>
          </defs>
          <path
            d="M 18 20 L 48 20 L 48 88 C 48 106, 62 118, 78 118 C 94 118, 108 106, 108 88 L 108 20 L 138 20 L 138 90 C 138 126, 112 148, 78 148 C 44 148, 18 126, 18 90 Z"
            fill="url(#uatIconGrad)"
          />
          <path
            d="M 194 14 L 252 148 L 220 148 L 204 110 L 162 110 L 156 124 L 126 148 L 182 14 Z M 174 84 L 195 84 L 185 58 Z"
            fill="url(#uatIconGrad)"
            fillRule="evenodd"
          />
          <path
            d="M 226 22 L 316 22 C 328 22, 336 28, 336 38 C 336 46, 328 50, 318 52 L 278 52 L 278 148 L 248 148 L 248 52 L 226 52 Z"
            fill="url(#uatIconGrad)"
          />
        </svg>
      </div>
    );
  }

  // ==============================================================
  // 4. VARIANTE COMPACTA (Ideal para header y barras laterales)
  // ==============================================================
  if (variant === 'compact') {
    const titleColor =
      textColor === 'light'
        ? 'text-white'
        : textColor === 'dark'
        ? 'text-slate-900'
        : 'text-slate-900 dark:text-white';

    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {/* Monograma oficial estilizado */}
        <div className="w-10 h-7 shrink-0">
          <svg
            viewBox="0 0 340 160"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="uatCompactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F57C00" />
                <stop offset="100%" stopColor="#D84A00" />
              </linearGradient>
            </defs>
            <path
              d="M 18 20 L 48 20 L 48 88 C 48 106, 62 118, 78 118 C 94 118, 108 106, 108 88 L 108 20 L 138 20 L 138 90 C 138 126, 112 148, 78 148 C 44 148, 18 126, 18 90 Z"
              fill="url(#uatCompactGrad)"
            />
            <path
              d="M 194 14 L 252 148 L 220 148 L 204 110 L 162 110 L 156 124 L 126 148 L 182 14 Z M 174 84 L 195 84 L 185 58 Z"
              fill="url(#uatCompactGrad)"
              fillRule="evenodd"
            />
            <path
              d="M 226 22 L 316 22 C 328 22, 336 28, 336 38 C 336 46, 328 50, 318 52 L 278 52 L 278 148 L 248 148 L 248 52 L 226 52 Z"
              fill="url(#uatCompactGrad)"
            />
            <path
              d="M 246 36 C 278 36, 310 32, 332 26 C 334 30, 335 34, 334 38 C 312 44, 280 46, 246 44 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-heading font-extrabold text-sm tracking-tight ${titleColor}`}>
              Tutorías UAT
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
              Univ. Autónoma de Tamaulipas
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==============================================================
  // 5. VARIANTE HORIZONTAL (Por defecto, para Header principal)
  // Combina el escudo heráldico o logotipo oficial con el título del sistema
  // ==============================================================
  const titleColor =
    textColor === 'light'
      ? 'text-white'
      : textColor === 'dark'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const subtitleColor =
    textColor === 'light'
      ? 'text-slate-300'
      : textColor === 'dark'
      ? 'text-slate-600'
      : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Escudo heráldico circular miniatura de gran detalle */}
      <div className="shrink-0 p-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <UatHeraldicSeal
          size={42}
          textColor={textColor}
          showMotto={false}
        />
      </div>

      {/* Logotipo UAT moderno y denominación del sistema */}
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          {/* Logo UAT tipográfico oficial */}
          <div className="w-14 h-5.5 shrink-0">
            <svg
              viewBox="0 0 340 160"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="uatHGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F57C00" />
                  <stop offset="50%" stopColor="#EE7402" />
                  <stop offset="100%" stopColor="#D84A00" />
                </linearGradient>
              </defs>
              <path
                d="M 18 20 L 48 20 L 48 88 C 48 106, 62 118, 78 118 C 94 118, 108 106, 108 88 L 108 20 L 138 20 L 138 90 C 138 126, 112 148, 78 148 C 44 148, 18 126, 18 90 Z"
                fill="url(#uatHGrad)"
              />
              <path
                d="M 194 14 L 252 148 L 220 148 L 204 110 L 162 110 L 156 124 L 126 148 L 182 14 Z M 174 84 L 195 84 L 185 58 Z"
                fill="url(#uatHGrad)"
                fillRule="evenodd"
              />
              <path
                d="M 226 22 L 316 22 C 328 22, 336 28, 336 38 C 336 46, 328 50, 318 52 L 278 52 L 278 148 L 248 148 L 248 52 L 226 52 Z"
                fill="url(#uatHGrad)"
              />
              <path
                d="M 246 36 C 278 36, 310 32, 332 26 C 334 30, 335 34, 334 38 C 312 44, 280 46, 246 44 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
          <span className={`font-heading font-bold text-sm tracking-tight ${titleColor}`}>
            Sistema Institucional de Tutorías
          </span>
        </div>

        {showSubtitle && (
          <p className={`text-[11px] font-normal tracking-tight truncate ${subtitleColor} mt-0.5`}>
            Universidad Autónoma de Tamaulipas &bull; <span className="font-serif italic text-[10px]">Verdad, Belleza, Probidad</span>
          </p>
        )}
      </div>
    </div>
  );
};
