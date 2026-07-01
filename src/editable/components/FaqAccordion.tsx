'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FaqItem = { question: string; answer: string }
type FaqCategory = { name: string; items: readonly FaqItem[] }

export function FaqAccordion({ categories }: { categories: readonly FaqCategory[] }) {
  const [openKey, setOpenKey] = useState<string | null>(`${categories[0]?.name}-0`)

  return (
    <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
      {categories.map((category) => (
        <div key={category.name}>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{category.name}</h3>
          <div className="mt-4 flex flex-col gap-2">
            {category.items.map((item, index) => {
              const key = `${category.name}-${index}`
              const open = openKey === key
              return (
                <div key={key} className="overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-[var(--slot4-page-text)]"
                    aria-expanded={open}
                  >
                    {item.question}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--slot4-muted-text)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="faq-panel-wrap" data-open={open ? 'true' : 'false'}>
                    <div className="faq-panel-inner">
                      <p className="px-5 pb-4 text-sm leading-6 text-[var(--slot4-muted-text)]">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
