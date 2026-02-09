import Image from 'next/image'

export type MascotteVariant = 'laptop' | 'smartphone' | 'cursor'
export type MascotteSize = 'sm' | 'md' | 'lg'

interface MascotteProps {
  variant: MascotteVariant
  size?: MascotteSize
}

const variantConfig: Record<MascotteVariant, { src: string; alt: string }> = {
  laptop: {
    src: '/mascotte/laptop.jpg',
    alt: 'Mascotte etudiant avec ordinateur portable',
  },
  smartphone: {
    src: '/mascotte/smartphone.jpg',
    alt: 'Mascotte etudiant avec smartphone',
  },
  cursor: {
    src: '/mascotte/cursor.jpg',
    alt: 'Mascotte etudiant avec curseur',
  },
}

const sizeClasses: Record<MascotteSize, string> = {
  sm: 'w-32 h-32',
  md: 'w-56 h-56',
  lg: 'w-80 h-80',
}

export default function Mascotte({ variant, size = 'lg' }: MascotteProps) {
  const config = variantConfig[variant]

  return (
    <div
      className={`relative ${sizeClasses[size]} transition-transform duration-300 hover:scale-105`}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 blur-2xl opacity-40" />
      <Image
        src={config.src}
        alt={config.alt}
        fill
        className="object-contain drop-shadow-xl relative z-10 rounded-3xl"
        priority
      />
    </div>
  )
}
