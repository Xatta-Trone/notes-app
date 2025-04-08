import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

interface Option {
  value: string
  label: string
  color?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace" && !inputValue && selected.length > 0) {
        onChange(selected.slice(0, -1))
      }
    },
    [inputValue, onChange, selected]
  )

  return (
    <Command className="overflow-visible bg-white">
      <div
        className="group border border-input px-3 py-2 text-sm rounded-md focus-within:ring-2 focus-within:ring-ring"
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value)
            if (!option) return null
            
            return (
              <Badge
                key={value}
                style={{ backgroundColor: option.color }}
                className="rounded-sm px-1 font-normal"
              >
                {option.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(value)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
          />
        </div>
      </div>
      <div className="relative">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onSelect={() => {
                    onChange(
                      selected.includes(option.value)
                        ? selected.filter((value) => value !== option.value)
                        : [...selected, option.value]
                    )
                    setInputValue("")
                  }}
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    }`}
                  >
                    {selected.includes(option.value) && "✓"}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
}