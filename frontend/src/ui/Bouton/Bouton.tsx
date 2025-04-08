import React from 'react';

type Variant = 'purple' | 'yellow' | 'cyan' | 'red' | 'gray' | 'green' | 'blue' | 'orange' | 'pink';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Classes par variante (couleurs)
const variantStyles: Record<Variant, string> = {
  purple: 'bg-purple-500 text-white hover:bg-purple-600',
  yellow: 'bg-yellow-500 text-white hover:bg-yellow-600',
  cyan:   'bg-cyan-500 text-white hover:bg-cyan-600',
  red:    'bg-red-500 text-white hover:bg-red-600',
  gray:   'bg-gray-500 text-white hover:bg-gray-600',
  green:  'bg-green-500 text-white hover:bg-green-600',
  blue:   'bg-blue-500 text-white hover:bg-blue-600',
  orange: 'bg-orange-500 text-white hover:bg-orange-600',
  pink:   'bg-pink-500 text-white hover:bg-pink-600',
};

// Classes par taille
const sizeStyles: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-2.5',
};

export function Button({
  variant = 'purple',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  // Classe de base commune à tous les boutons
  const baseClasses = [
    'inline-flex items-center justify-center',
    'rounded-md font-medium transition-colors',
    'focus:outline-none',
    'disabled:opacity-50 disabled:pointer-events-none',
  ].join(' ');

  // Récupération des classes en fonction des props
  const variantClass = variantStyles[variant] ?? '';
  const sizeClass = sizeStyles[size] ?? '';

  // Combinaison finale des classes
  const finalClass = [baseClasses, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
}
