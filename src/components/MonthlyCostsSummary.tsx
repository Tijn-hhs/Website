interface FixedCostsBreakdown {
  rent: number
  utilities: number
  internet: number
  mobile: number
  transport: number
}

interface VariableCostsBreakdown {
  groceries: number
  diningOut: number
  entertainment: number
  clothing: number
  personalCare: number
  books: number
}

interface MonthlyCostsSummaryProps {
  fixedCosts: FixedCostsBreakdown
  variableCosts: VariableCostsBreakdown
}

export default function MonthlyCostsSummary({ fixedCosts, variableCosts }: MonthlyCostsSummaryProps) {
  const fixedTotal = fixedCosts.rent + fixedCosts.utilities + fixedCosts.internet + fixedCosts.mobile + fixedCosts.transport
  const variableTotal = variableCosts.groceries + variableCosts.diningOut + variableCosts.entertainment + variableCosts.clothing + variableCosts.personalCare + variableCosts.books
  const grandTotal = fixedTotal + variableTotal

  const fixedCostItems = [
    { label: 'Rent', amount: fixedCosts.rent },
    { label: 'Utilities', amount: fixedCosts.utilities },
    { label: 'Internet', amount: fixedCosts.internet },
    { label: 'Mobile', amount: fixedCosts.mobile },
    { label: 'Public transport', amount: fixedCosts.transport },
  ]

  const variableCostItems = [
    { label: 'Groceries & food', amount: variableCosts.groceries },
    { label: 'Dining out', amount: variableCosts.diningOut },
    { label: 'Entertainment', amount: variableCosts.entertainment },
    { label: 'Clothing', amount: variableCosts.clothing },
    { label: 'Personal care', amount: variableCosts.personalCare },
    { label: 'Books & materials', amount: variableCosts.books },
  ]

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Monthly Budget Summary
      </h2>

      {/* Fixed Costs Section */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-800 mb-2">Fixed Costs</h3>
        <div className="space-y-2">
          {fixedCostItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900">
                €{item.amount.toLocaleString('en-US')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-900">Fixed costs subtotal</span>
            <span className="text-base font-semibold text-slate-900">
              €{fixedTotal.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Variable Costs Section */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-800 mb-2">Variable Costs</h3>
        <div className="space-y-2">
          {variableCostItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900">
                €{item.amount.toLocaleString('en-US')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-900">Variable costs subtotal</span>
            <span className="text-base font-semibold text-slate-900">
              €{variableTotal.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div className="pt-4 border-t-2 border-slate-300">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-slate-900">
            Total Monthly Budget
          </span>
          <span className="text-2xl font-bold text-blue-700">
            €{grandTotal.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Extra info */}
      <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">💡 Tip:</span> This budget doesn't include one-time expenses like visa fees, 
          travel costs, or initial setup costs. Consider adding a buffer of €500-1000 for unexpected expenses.
        </p>
      </div>
    </article>
  )
}
