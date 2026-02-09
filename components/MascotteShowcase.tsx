'use client'

import { useState } from 'react'
import Mascotte, { type MascotteVariant } from './Mascotte'
import { Laptop, Smartphone, MousePointer } from 'lucide-react'

const variants: { key: MascotteVariant; label: string; icon: typeof Laptop }[] = [
  { key: 'laptop', label: 'Laptop', icon: Laptop },
  { key: 'smartphone', label: 'Smartphone', icon: Smartphone },
  { key: 'cursor', label: 'Curseur', icon: MousePointer },
]

export default function MascotteShowcase() {
  const [current, setCurrent] = useState<MascotteVariant>('laptop')

  return (
    <div className="flex flex-col items-center gap-6">
      <Mascotte variant={current} size="lg" />
      <div className="flex gap-3">
        {variants.map(({ key, label, icon: Icon }) => {
          const isActive = current === key
          return (
            <button
              key={key}
              onClick={() => setCurrent(key)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
