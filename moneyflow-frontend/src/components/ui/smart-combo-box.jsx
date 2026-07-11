import React, { useState, useEffect, useMemo, useRef, useCallback, useId } from "react";
import { ChevronDown, Check, Plus, X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // I'll check if this exists or use a fallback

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function useDebounced(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function SmartCombobox({
  id,
  className,
  label,
  placeholder = "Search…",
  disabled,
  clearable = true,
  multiple = false,
  onQuery,
  onCreate,
  getCreateLabel = (q) => `Create “${q}”`,
  onValueChange,
  options: optionsProp = [],
  value: valueProp = multiple ? [] : null,
  open: controlledOpen,
  onOpenChange,
  header,
  footer,
  emptyState,
  renderOption,
  maxHeight = 320,
  itemHeight = 40,
  virtualizeThreshold = 120,
}) {
  const inputId = useId();
  const listboxId = useId();
  const activeDescId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [openU, setOpenU] = useState(false);
  const open = controlledOpen ?? openU;

  const isMultiple = !!multiple;
  const [internalValue, setInternalValue] = useState(
    isMultiple ? (Array.isArray(valueProp) ? valueProp : []) : []
  );

  // Reflect controlled value when provided
  useEffect(() => {
    if (isMultiple) {
      if (Array.isArray(valueProp)) setInternalValue(valueProp);
    }
  }, [valueProp, isMultiple]);

  const singleValue = !isMultiple ? (typeof valueProp === "string" ? valueProp : null) : null;

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 150);
  const [loading, setLoading] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState(null);

  // Compute base options (local or remote)
  useEffect(() => {
    let didCancel = false;
    if (!onQuery) {
      setRemoteOptions(null);
      return;
    }
    setLoading(true);
    onQuery(debouncedQuery)
      .then((res) => {
        if (!didCancel) setRemoteOptions(res || []);
      })
      .finally(() => {
        if (!didCancel) setLoading(false);
      });
    return () => {
      didCancel = true;
    };
  }, [onQuery, debouncedQuery]);

  const baseOptions = onQuery ? remoteOptions ?? [] : optionsProp;

  // Local filter if no onQuery
  const filtered = useMemo(() => {
    if (onQuery) return baseOptions;
    const q = normalize(debouncedQuery);
    if (!q) return baseOptions;
    return baseOptions.filter((o) => normalize(o.label).includes(q));
  }, [baseOptions, debouncedQuery, onQuery]);

  // Sort by group then label
  const options = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const g = (a.group || "").localeCompare(b.group || "");
      return g !== 0 ? g : a.label.localeCompare(b.label);
    });
    return copy;
  }, [filtered]);

  // Active index for keyboard nav
  const [activeIndex, setActiveIndex] = useState(0);

  // “Create …” affordance
  const showCreate =
    !!onCreate && debouncedQuery.trim().length > 0 && !options.some((o) => normalize(o.label) === normalize(debouncedQuery));

  // Virtualization calculations
  const useVirtual = options.length > virtualizeThreshold;
  const [scrollTop, setScrollTop] = useState(0);
  const viewportCount = Math.max(1, Math.floor(maxHeight / itemHeight));
  const overscan = 4;
  const start = useVirtual ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) : 0;
  const end = useVirtual ? Math.min(options.length, Math.ceil((scrollTop + maxHeight) / itemHeight) + overscan) : options.length;
  const visible = useVirtual ? options.slice(start, end) : options;
  const paddingTop = useVirtual ? start * itemHeight : 0;
  const paddingBottom = useVirtual ? (options.length - end) * itemHeight : 0;

  // Utilities for selection state
  const isSelected = useCallback(
    (id) => {
      if (isMultiple) return internalValue.includes(id);
      return singleValue === id;
    },
    [internalValue, singleValue, isMultiple]
  );

  const commitChange = useCallback(
    (next) => {
      onValueChange(next);
    },
    [onValueChange]
  );

  function toggleOption(opt) {
    if (opt.disabled) return;
    if (isMultiple) {
      const next = isSelected(opt.id)
        ? internalValue.filter((x) => x !== opt.id)
        : [...internalValue, opt.id];
      setInternalValue(next);
      commitChange(next);
    } else {
      commitChange(isSelected(opt.id) ? null : opt.id);
      setOpen(false);
    }
    setQuery("");
  }

  function removeChip(id) {
    if (!isMultiple) return;
    const next = internalValue.filter((x) => x !== id);
    setInternalValue(next);
    commitChange(next);
  }

  function clearAll() {
    if (disabled) return;
    if (isMultiple) {
      setInternalValue([]);
      commitChange([]);
    } else {
      commitChange(null);
    }
    setQuery("");
    inputRef.current?.focus();
  }

  function setOpen(next) {
    if (disabled) return;
    if (controlledOpen === undefined) setOpenU(next);
    onOpenChange?.(next);
    if (next) {
      // Focus input when opening
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  // Click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      const el = containerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Keep activeIndex in range on data changes
  useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(i, options.length - 1)));
  }, [options.length]);

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " " || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) {
      // Backspace removes last chip when input empty (multi)
      if (isMultiple && e.key === "Backspace" && query.length === 0 && internalValue.length) {
        removeChip(internalValue[internalValue.length - 1]);
      }
      return;
    }

    const maxIndex = options.length - 1;
    const step = (delta) => setActiveIndex((i) => Math.max(0, Math.min(maxIndex, i + delta)));

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        step(1);
        ensureVisible(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        step(-1);
        ensureVisible(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        ensureVisible(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(maxIndex);
        ensureVisible(maxIndex);
        break;
      case "PageDown":
        e.preventDefault();
        step(viewportCount);
        ensureVisible(activeIndex + viewportCount);
        break;
      case "PageUp":
        e.preventDefault();
        step(-viewportCount);
        ensureVisible(activeIndex - viewportCount);
        break;
      case "Enter":
        e.preventDefault();
        if (showCreate && activeIndex === 0) {
          handleCreate(debouncedQuery);
          return;
        }
        {
          const idx = showCreate ? activeIndex - 1 : activeIndex;
          const target = options[idx];
          if (target) toggleOption(target);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  function ensureVisible(index) {
    if (!listRef.current) return;
    if (!useVirtual) {
      const child = listRef.current.querySelector(`[data-idx="${index}"]`);
      child?.scrollIntoView({ block: "nearest" });
      return;
    }
    const min = index * itemHeight;
    const max = min + itemHeight;
    const st = listRef.current.scrollTop;
    const vh = maxHeight;
    if (min < st) listRef.current.scrollTop = min;
    else if (max > st + vh) listRef.current.scrollTop = max - vh;
  }

  async function handleCreate(q) {
    if (!onCreate || !q.trim()) return;
    const newOpt = await onCreate(q.trim());
    if (Array.isArray(baseOptions)) {
      setRemoteOptions([newOpt, ...baseOptions]);
    }
    toggleOption(newOpt);
    setQuery("");
  }

  const groups = useMemo(() => {
    const map = new Map();
    for (const o of visible) {
      const g = o.group || "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(o);
    }
    return map;
  }, [visible]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative w-full ${className || ""}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1"
        >
          {label}
        </label>
      )}

      <div
        className={`group flex min-h-12 w-full items-center gap-2 rounded-xl border bg-zinc-950/50 px-3 cursor-pointer transition-all duration-300 ${
          open 
          ? "border-emerald-500/50 ring-4 ring-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
          : "border-zinc-800 hover:border-zinc-700 shadow-sm"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (!open) setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selection Display */}
        {!isMultiple && singleValue && !query && (
           <div className="flex items-center gap-2 animate-in fade-in duration-300">
              {baseOptions.find(o => o.id === singleValue)?.icon && (
                <span className="size-4 text-emerald-500">
                  {baseOptions.find(o => o.id === singleValue).icon}
                </span>
              )}
              <span className="text-sm font-semibold text-white">
                {baseOptions.find(o => o.id === singleValue)?.label}
              </span>
           </div>
        )}

        {/* Chips for multi mode */}
        {isMultiple && internalValue.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {internalValue.map((id) => {
              const opt = baseOptions.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider animate-in zoom-in-95 duration-200"
                >
                  {opt.icon ? <span className="size-3">{opt.icon}</span> : null}
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChip(id);
                    }}
                    className="ml-1 hover:text-emerald-300 transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          autoComplete="off"
          placeholder={(!isMultiple && singleValue) ? "" : placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none placeholder:text-zinc-700 text-sm font-medium text-white min-w-[60px]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />

        <div className="flex items-center gap-1">
          {clearable && ((isMultiple && internalValue.length > 0) || (!isMultiple && singleValue)) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-zinc-600 transition-transform duration-300 ${open ? "rotate-180 text-emerald-500" : ""}`} 
          />
        </div>
      </div>

      {open && (
        <div
          className="absolute z-[110] mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top"
          style={{ maxHeight }}
        >
          {header && (
            <div className="border-b border-zinc-800/50 p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
              {header}
            </div>
          )}

          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="overflow-auto custom-scrollbar"
            style={{ maxHeight: header || footer ? maxHeight - 80 : maxHeight }}
            onScroll={(e) => {
              if (!useVirtual) return;
              setScrollTop(e.currentTarget.scrollTop);
            }}
          >
            {showCreate && (
              <div
                role="option"
                onMouseEnter={() => setActiveIndex(0)}
                onClick={() => handleCreate(debouncedQuery)}
                className={`flex cursor-pointer items-center gap-3 px-4 transition-all ${
                  activeIndex === 0 ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-800/30"
                }`}
                style={{ height: itemHeight }}
              >
                <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                   <Plus size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-bold">{getCreateLabel(debouncedQuery)}</span>
              </div>
            )}

            {useVirtual && paddingTop > 0 && <div style={{ height: paddingTop }} />}

            {[...groups.entries()].map(([group, items]) => (
              <div key={group}>
                {group !== "Other" && (
                  <div className="sticky top-0 z-20 bg-zinc-900/90 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50">
                    {group}
                  </div>
                )}
                {items.map((opt) => {
                  const idx = options.indexOf(opt) + (showCreate ? 1 : 0);
                  const active = idx === activeIndex;
                  const selected = isSelected(opt.id);

                  if (renderOption) {
                    return (
                      <div
                        key={opt.id}
                        role="option"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => toggleOption(opt)}
                        className={`flex cursor-pointer items-center px-4 transition-all ${
                          active ? "bg-emerald-500/10" : "hover:bg-zinc-800/30"
                        }`}
                        style={{ height: itemHeight }}
                      >
                        {renderOption(opt, { active, selected })}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={opt.id}
                      role="option"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => toggleOption(opt)}
                      className={`flex cursor-pointer items-center justify-between px-4 transition-all ${
                        active ? "bg-emerald-500/10" : "hover:bg-zinc-800/40"
                      }`}
                      style={{ height: itemHeight }}
                    >
                      <div className="flex items-center gap-3">
                        {opt.icon && <span className={`size-5 transition-colors ${active || selected ? "text-emerald-500" : "text-zinc-600"}`}>{opt.icon}</span>}
                        <span className={`text-sm font-bold transition-colors ${selected ? "text-emerald-400" : active ? "text-white" : "text-zinc-400"}`}>
                          {opt.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {opt.meta && (
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? "text-emerald-500/70" : "text-zinc-700"}`}>
                            {opt.meta}
                          </span>
                        )}
                        {selected && <Check size={16} className="text-emerald-500" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {useVirtual && paddingBottom > 0 && <div style={{ height: paddingBottom }} />}

            {loading && (
              <div className="flex items-center justify-center p-8 gap-3 text-emerald-500/50">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Searching...</span>
              </div>
            )}

            {!loading && options.length === 0 && !showCreate && (
              <div className="px-4 py-10 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto text-zinc-700">
                  <Search size={24} />
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  {emptyState || "No results found"}
                </p>
              </div>
            )}
          </div>

          {footer && (
            <div className="border-t border-zinc-800/50 p-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-950/20 text-center">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
