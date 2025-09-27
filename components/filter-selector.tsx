"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Filter, FilterType } from "./camera-app"

interface FilterSelectorProps {
  filters: Filter[]
  selectedFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function FilterSelector({ filters, selectedFilter, onFilterChange }: FilterSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={selectedFilter === filter.id ? "default" : "outline"}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "h-auto p-3 flex flex-col items-center gap-2 text-left",
            selectedFilter === filter.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          <div className="flex items-center gap-2 w-full">
            {filter.icon}
            <span className="font-medium text-sm">{filter.name}</span>
          </div>
        </Button>
      ))}
    </div>
  )
}
