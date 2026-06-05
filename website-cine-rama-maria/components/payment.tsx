'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, CheckCircle, AlertCircle } from 'lucide-react'
import { venezuelanBanks } from '@/lib/mock-data'

// Payment data types matching PostgreSQL schema expectations
export interface PagoMovilData {
  banco: string
  telefono: string
  cedula: string
  monto: number
  referencia: string
}

export interface PayPalData {
  email: string
  monto: number
}

interface PaymentGatewayProps {
  amount: number
  onPaymentComplete: (method: 'pago_movil' | 'paypal', data: PagoMovilData | PayPalData) => void
  isProcessing?: boolean
}

export function PaymentGateway({ amount, onPaymentComplete, isProcessing = false }: PaymentGatewayProps) {
  const [activeTab, setActiveTab] = useState<'pago_movil' | 'paypal'>('pago_movil')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pago Móvil form state - aligned with Venezuelan payment standards
  const [pagoMovilData, setPagoMovilData] = useState<PagoMovilData>({
    banco: '',
    telefono: '',
    cedula: '',
    monto: amount,
    referencia: ''
  })

  // PayPal form state
  const [paypalData, setPaypalData] = useState<PayPalData>({
    email: '',
    monto: amount
  })

  const handlePagoMovilSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsValidating(true)

    // Validate required fields
    if (!pagoMovilData.banco || !pagoMovilData.telefono || !pagoMovilData.cedula || !pagoMovilData.referencia) {
      setError('Por favor complete todos los campos')
      setIsValidating(false)
      return
    }

    // Validate phone format (Venezuelan format: 0414-1234567)
    const phoneRegex = /^04\d{2}-?\d{7}$/
    if (!phoneRegex.test(pagoMovilData.telefono.replace(/-/g, ''))) {
      setError('Formato de teléfono inválido. Use: 0414-1234567')
      setIsValidating(false)
      return
    }

    // Validate cedula (numeric only)
    if (!/^\d{6,10}$/.test(pagoMovilData.cedula)) {
      setError('Cédula inválida. Solo números (6-10 dígitos)')
      setIsValidating(false)
      return
    }

    // Validate reference number (6 digits)
    if (!/^\d{4,8}$/.test(pagoMovilData.referencia)) {
      setError('Referencia inválida. Ingrese los últimos 4-8 dígitos')
      setIsValidating(false)
      return
    }

    // In production: Here you would call your payment verification API
    // POST /api/payments/pago-movil to verify the transaction
    // For now, simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsValidating(false)
    onPaymentComplete('pago_movil', { ...pagoMovilData, monto: amount })
  }

  const handlePaypalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsValidating(true)

    if (!paypalData.email || !paypalData.email.includes('@')) {
      setError('Por favor ingrese un email válido de PayPal')
      setIsValidating(false)
      return
    }

    // In production: Here you would redirect to PayPal or use PayPal SDK
    // to create a payment session
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsValidating(false)
    onPaymentComplete('paypal', { ...paypalData, monto: amount })
  }

  const processing = isProcessing || isValidating

  return (
    <div className="w-full">
      {/* Amount Display */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
        <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
        <p className="text-3xl font-bold text-primary">${amount.toFixed(2)}</p>
      </div>

      {/* Payment Method Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pago_movil')}
          disabled={processing}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
            ${activeTab === 'pago_movil'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }
            disabled:opacity-50
          `}
        >
          <Smartphone className="w-5 h-5" />
          Pago Móvil
        </button>
        <button
          onClick={() => setActiveTab('paypal')}
          disabled={processing}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
            ${activeTab === 'paypal'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }
            disabled:opacity-50
          `}
        >
          <CreditCard className="w-5 h-5" />
          PayPal
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Pago Móvil Form */}
      {activeTab === 'pago_movil' && (
        <form onSubmit={handlePagoMovilSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Banco Emisor
            </label>
            <select
              value={pagoMovilData.banco}
              onChange={(e) => setPagoMovilData({ ...pagoMovilData, banco: e.target.value })}
              disabled={processing}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            >
              <option value="">Seleccione su banco</option>
              {venezuelanBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de Teléfono
            </label>
            <input
              type="tel"
              value={pagoMovilData.telefono}
              onChange={(e) => setPagoMovilData({ ...pagoMovilData, telefono: e.target.value })}
              placeholder="0414-1234567"
              disabled={processing}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cédula de Identidad
            </label>
            <div className="flex gap-2">
              <select 
                disabled={processing}
                className="px-3 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option>V</option>
                <option>E</option>
                <option>J</option>
                <option>P</option>
              </select>
              <input
                type="text"
                value={pagoMovilData.cedula}
                onChange={(e) => setPagoMovilData({ ...pagoMovilData, cedula: e.target.value.replace(/\D/g, '') })}
                placeholder="12345678"
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de Referencia
            </label>
            <input
              type="text"
              value={pagoMovilData.referencia}
              onChange={(e) => setPagoMovilData({ ...pagoMovilData, referencia: e.target.value.replace(/\D/g, '') })}
              placeholder="Últimos 6 dígitos de confirmación"
              disabled={processing}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Procesando pago...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirmar Pago
              </>
            )}
          </button>
        </form>
      )}

      {/* PayPal Form */}
      {activeTab === 'paypal' && (
        <form onSubmit={handlePaypalSubmit} className="space-y-4">
          <div className="p-4 rounded-lg bg-[#003087]/10 border border-[#003087]/30 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-24 h-6" viewBox="0 0 101 32" fill="none">
                <path d="M12.237 6.004H5.665a.891.891 0 00-.881.753L2.028 26.392a.535.535 0 00.528.618h3.132a.892.892 0 00.881-.753l.744-4.718a.892.892 0 01.882-.753h2.034c4.237 0 6.681-2.05 7.32-6.116.288-1.777.012-3.173-.821-4.15-.915-1.074-2.536-1.516-4.491-1.516z" fill="#003087"/>
                <path d="M13.132 11.885c-.352 2.314-2.12 2.314-3.83 2.314h-.972l.683-4.32a.535.535 0 01.528-.452h.446c1.164 0 2.263 0 2.83.663.34.396.442.983.315 1.795z" fill="#003087"/>
                <path d="M28.603 11.785h-3.145a.535.535 0 00-.528.452l-.139.878-.22-.318c-.68-.987-2.196-1.317-3.71-1.317-3.47 0-6.435 2.628-7.012 6.314-.3 1.839.126 3.597 1.17 4.823.96 1.126 2.33 1.595 3.963 1.595 2.801 0 4.355-1.801 4.355-1.801l-.14.874a.535.535 0 00.528.619h2.832a.892.892 0 00.881-.753l1.698-10.747a.535.535 0 00-.533-.619z" fill="#003087"/>
                <path d="M24.17 18.03c-.302 1.793-1.723 2.996-3.542 2.996-.914 0-1.645-.294-2.114-.85-.465-.552-.64-1.337-.493-2.21.282-1.778 1.725-3.02 3.513-3.02.894 0 1.62.297 2.098.858.481.566.67 1.357.538 2.226z" fill="#003087"/>
                <path d="M44.123 11.785h-3.157a.892.892 0 00-.737.392l-4.257 6.27-1.804-6.025a.892.892 0 00-.854-.637h-3.102a.535.535 0 00-.507.711l3.398 9.974-3.197 4.51a.535.535 0 00.438.846h3.154a.892.892 0 00.734-.386l10.267-14.823a.535.535 0 00-.376-.832z" fill="#003087"/>
                <path d="M55.637 6.004h-6.571a.891.891 0 00-.881.753l-2.757 17.635a.535.535 0 00.528.618h3.404a.625.625 0 00.617-.528l.782-4.943a.892.892 0 01.882-.753h2.034c4.237 0 6.681-2.05 7.32-6.116.288-1.777.012-3.173-.821-4.15-.915-1.074-2.536-1.516-4.537-1.516z" fill="#009cde"/>
                <path d="M56.533 11.885c-.352 2.314-2.12 2.314-3.83 2.314h-.972l.683-4.32a.535.535 0 01.528-.452h.446c1.164 0 2.263 0 2.83.663.34.396.442.983.315 1.795z" fill="#009cde"/>
                <path d="M72.003 11.785h-3.145a.535.535 0 00-.528.452l-.139.878-.22-.318c-.68-.987-2.196-1.317-3.71-1.317-3.47 0-6.435 2.628-7.012 6.314-.3 1.839.126 3.597 1.17 4.823.96 1.126 2.33 1.595 3.963 1.595 2.801 0 4.355-1.801 4.355-1.801l-.14.874a.535.535 0 00.528.619h2.832a.892.892 0 00.881-.753l1.698-10.747a.535.535 0 00-.533-.619z" fill="#009cde"/>
                <path d="M67.57 18.03c-.302 1.793-1.723 2.996-3.542 2.996-.914 0-1.645-.294-2.114-.85-.465-.552-.64-1.337-.493-2.21.282-1.778 1.725-3.02 3.513-3.02.894 0 1.62.297 2.098.858.481.566.67 1.357.538 2.226z" fill="#009cde"/>
                <path d="M80.104 11.785h-3.154a.535.535 0 00-.528.452l-1.975 12.516a.535.535 0 00.528.618h2.72a.892.892 0 00.881-.753l1.968-12.468a.535.535 0 00-.44-.365z" fill="#009cde"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Pago seguro con PayPal. En producción, serás redirigido para completar el pago.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email de PayPal
            </label>
            <input
              type="email"
              value={paypalData.email}
              onChange={(e) => setPaypalData({ ...paypalData, email: e.target.value })}
              placeholder="tu@email.com"
              disabled={processing}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 rounded-lg bg-[#0070ba] text-white font-semibold hover:bg-[#003087] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Conectando con PayPal...
              </>
            ) : (
              'Pagar con PayPal'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
