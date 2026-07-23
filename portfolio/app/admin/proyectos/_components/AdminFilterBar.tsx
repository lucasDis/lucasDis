"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { inputClass } from "@/components/ui/Field";

export function AdminFilterBar({ years }: { years: number[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentYear = searchParams.get("year") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  const [search, setSearch] = useState(currentSearch);
  const [year, setYear] = useState(currentYear);
  const [status, setStatus] = useState(currentStatus);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setYear(currentYear);
  }, [currentYear]);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const applyFilters = (newSearch: string, newYear: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newYear) {
      params.set("year", newYear);
    } else {
      params.delete("year");
    }

    if (newStatus) {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    router.push(`/admin/proyectos?${params.toString()}`);
  };

  // Debounce search keystrokes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== currentSearch) {
        applyFilters(search, year, status);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-surface-soft p-4 rounded-lg border border-hairline w-full">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar por título, herramientas, cliente, rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          value={year}
          onChange={(e) => {
            const val = e.target.value;
            setYear(val);
            applyFilters(search, val, status);
          }}
          className={inputClass}
        >
          <option value="">Todos los años</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-48">
        <select
          value={status}
          onChange={(e) => {
            const val = e.target.value;
            setStatus(val);
            applyFilters(search, year, val);
          }}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
        </select>
      </div>
    </div>
  );
}
