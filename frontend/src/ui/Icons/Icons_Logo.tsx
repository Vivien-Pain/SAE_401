export default function Icons_Profiles({className}: { className?: string }) {
    return (
<svg
version="1.1"
width="300"
height="75"
viewBox="0 0 140 60"
xmlns="http://www.w3.org/2000/svg"
className={className}
>
{/* Définition du dégradé linéaire (teal → violet) */}
<defs>
  <linearGradient
    id="fliipGradient"
    x1="0%"
    y1="0%"
    x2="100%"
    y2="0%"
  >
    <stop offset="0%" stopColor="#30C9B0" />
    <stop offset="100%" stopColor="#6E50A3" />
  </linearGradient>
</defs>

{/* Groupe pour l'icône (cercle + formes blanches) */}
<g transform="translate(10, 10)">
  <circle cx="20" cy="20" r="20" fill="url(#fliipGradient)" />
  <path
    d="M 20 0
       A 20 20 0 0 1 40 20
       L 30 20
       A 10 10 0 0 0 20 10
       Z"
    fill="#FFFFFF"
    opacity="0.8"
  />
  <path
    d="M 20 0
       A 20 20 0 0 0 0 20
       L 10 20
       A 10 10 0 0 1 20 10
       Z"
    fill="#FFFFFF"
    opacity="0.8"
  />
</g>

<text
  x="60"
  y="38"
  fontFamily="Poppins, Arial, sans-serif"
  fontSize="30"
  fill="#3A235F"
  fontWeight="bold"
  letterSpacing="0.5"
>
  Fliip
</text>
</svg>
 );
}