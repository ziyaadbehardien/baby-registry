import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import { tones } from 'assets/theme';

const RADIUS = 36;
// Angles (degrees, maths convention) of the leaves on the left branch, from the bottom up the side.
const LEAF_ANGLES = [255, 230, 205, 180, 155];

const toPoint = (degrees) => {
  const radians = (degrees * Math.PI) / 180;
  return { x: 50 + RADIUS * Math.cos(radians), y: 50 - RADIUS * Math.sin(radians) };
};

// Each leaf follows the branch (tangent = 180 - angle in SVG rotation) and tilts outward slightly.
const leaves = LEAF_ANGLES.map((angle) => ({ ...toPoint(angle), rotate: 180 - angle + 25 }));

const branchStart = toPoint(265);
const branchEnd = toPoint(150);
const leftBranch = `M ${branchStart.x} ${branchStart.y} A ${RADIUS} ${RADIUS} 0 0 1 ${branchEnd.x} ${branchEnd.y}`;

/** Circular badge with a serif initial inside a laurel wreath, as in the design. */
const Monogram = ({ letter, size = 88 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      bgcolor: 'common.white',
      boxShadow: '0 4px 16px -6px rgba(45, 40, 37, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      role="img"
      aria-label={`${letter} monogram`}
    >
      <path d={leftBranch} fill="none" stroke={tones.secondary[50]} strokeWidth="1.2" />
      <path
        d={leftBranch}
        fill="none"
        stroke={tones.secondary[50]}
        strokeWidth="1.2"
        transform="translate(100 0) scale(-1 1)"
      />
      {leaves.map(({ x, y, rotate }, index) => (
        <g key={index}>
          <ellipse
            cx={x}
            cy={y}
            rx="2.6"
            ry="6.5"
            fill={tones.secondary[50]}
            transform={`rotate(${rotate} ${x} ${y})`}
          />
          <ellipse
            cx={100 - x}
            cy={y}
            rx="2.6"
            ry="6.5"
            fill={tones.secondary[50]}
            transform={`rotate(${-rotate} ${100 - x} ${y})`}
          />
        </g>
      ))}
      <text
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Playfair Display Variable', Georgia, serif"
        fontWeight="700"
        fontSize="38"
        fill={tones.primary[30]}
      >
        {letter}
      </text>
    </svg>
  </Box>
);

Monogram.propTypes = {
  letter: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export default Monogram;
