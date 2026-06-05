'use client'

import { X, MapPin, Phone, Clock } from 'lucide-react'

interface Branch {
  id: number
  name: string
  city: string
  address: string
  phone: string
  hours: string
}

const branches: Branch[] = [
  {
    id: 1,
    name: 'CineLux San Cristóbal',
    city: 'San Cristóbal',
    address: 'Centro Comercial Sambil, Nivel 3, Local C-301',
    phone: '+58 276-123-4567',
    hours: 'Lun - Dom: 11:00 AM - 11:00 PM'
  },
  {
    id: 2,
    name: 'CineLux Caracas',
    city: 'Caracas',
    address: 'Centro Comercial Líder, Torre Este, Piso 5',
    phone: '+58 212-987-6543',
    hours: 'Lun - Dom: 10:00 AM - 12:00 AM'
  },
  {
    id: 3,
    name: 'CineLux Zulia',
    city: 'Zulia',
    address: 'Centro Comercial Costa Verde, Planta Alta, Local A-42',
    phone: '+58 261-456-7890',
    hours: 'Lun - Dom: 11:00 AM - 11:00 PM'
  }
]

interface BranchesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BranchesModal({ isOpen, onClose }: BranchesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-cinema-dark/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Sucursales</h2>
              <p className="text-sm text-muted-foreground">Encuentra tu cine más cercano</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Branch List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {branches.map((branch) => (
            <div 
              key={branch.id}
              className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
            >
              {/* Branch name and city */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {branch.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {branch.city}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{branch.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{branch.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/30">
          <p className="text-sm text-muted-foreground text-center">
            Visítanos en cualquiera de nuestras sucursales y vive la mejor experiencia cinematográfica
          </p>
        </div>
      </div>
    </div>
  )
}
