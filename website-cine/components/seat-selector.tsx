'use client'

import { useState, useMemo } from 'react'
import type { Room } from '@/lib/api'

interface SeatSelectorProps {
  room: Room
  occupiedSeats: string[]
  selectedSeats: string[]
  onSeatSelect: (seats: string[]) => void
  maxSeats?: number
}

export function SeatSelector({ 
  room, 
  occupiedSeats, 
  selectedSeats, 
  onSeatSelect,
  maxSeats = 10 
}: SeatSelectorProps) {
  // Generate seat grid based on room capacity
  const seatGrid = useMemo(() => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const seatsPerRow = room.room_type === 'VIP' ? 5 : room.room_type === '3D' ? 10 : 12
    const totalRows = Math.ceil(room.total_capacity / seatsPerRow)
    
    return rows.slice(0, totalRows).map(row => ({
      row,
      seats: Array.from({ length: seatsPerRow }, (_, i) => `${row}${i + 1}`)
    }))
  }, [room])

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return
    
    if (selectedSeats.includes(seatId)) {
      onSeatSelect(selectedSeats.filter(s => s !== seatId))
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect([...selectedSeats, seatId])
    }
  }

  const getSeatStatus = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return 'occupied'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  return (
    <div className="w-full">
      {/* Screen indicator */}
      <div className="relative mb-8">
        <div className="h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mx-8" />
        <div className="h-8 bg-gradient-to-b from-primary/30 to-transparent rounded-b-[100%] mx-4" />
        <p className="text-center text-sm text-muted-foreground mt-2 tracking-widest uppercase">
          Pantalla
        </p>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-2">
        {seatGrid.map(({ row, seats }) => (
          <div key={row} className="flex items-center gap-2">
            {/* Row label */}
            <span className="w-6 text-sm font-medium text-muted-foreground text-right">
              {row}
            </span>
            
            {/* Seats */}
            <div className="flex gap-1.5">
              {seats.map((seatId, index) => {
                const status = getSeatStatus(seatId)
                // Add aisle gap in the middle
                const hasAisle = index === Math.floor(seats.length / 2) - 1
                
                return (
                  <div key={seatId} className={hasAisle ? 'mr-4' : ''}>
                    <button
                      onClick={() => handleSeatClick(seatId)}
                      disabled={status === 'occupied'}
                      className={`
                        w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg text-xs font-medium
                        transition-all duration-200 transform
                        ${status === 'available' 
                          ? 'bg-seat-available hover:bg-primary/50 hover:scale-110 text-muted-foreground hover:text-foreground cursor-pointer' 
                          : status === 'selected'
                          ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30'
                          : 'bg-seat-occupied text-muted-foreground/50 cursor-not-allowed'
                        }
                      `}
                      title={`Asiento ${seatId}${status === 'occupied' ? ' (Ocupado)' : ''}`}
                    >
                      {seatId.slice(1)}
                    </button>
                  </div>
                )
              })}
            </div>
            
            {/* Row label (right side) */}
            <span className="w-6 text-sm font-medium text-muted-foreground">
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-seat-available" />
          <span className="text-sm text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-primary shadow-lg shadow-primary/30" />
          <span className="text-sm text-muted-foreground">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-seat-occupied" />
          <span className="text-sm text-muted-foreground">Ocupado</span>
        </div>
      </div>

      {/* Selection summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Asientos seleccionados:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.sort().map(seat => (
              <span 
                key={seat} 
                className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                {seat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
