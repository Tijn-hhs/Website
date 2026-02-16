import { getBigMacPrice } from '../lib/cityConfig'

interface BigMacInfoProps {
  city: string
}

export default function BigMacInfo({ city }: BigMacInfoProps) {
  const price = getBigMacPrice(city)

  return (
    <article className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md">
      <div className="flex items-start gap-4">
        {/* Hamburger emoji */}
        <div className="flex-shrink-0 text-5xl" role="img" aria-label="hamburger">
          🍔
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Big Mac Index</h2>
          
          {price !== undefined ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                A Big Mac in <span className="font-semibold text-orange-700">{city}</span> costs{' '}
                <span className="text-xl font-bold text-orange-600">€{price.toFixed(2)}</span>
              </p>
              <p className="text-sm text-slate-600">
                The Big Mac Index is an informal measure of purchasing power that helps compare
                the cost of living between cities.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-700">
              Big Mac price for this city is currently not available.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
