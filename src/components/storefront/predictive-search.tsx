"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/config/currency";
import { Search, X, Loader2 } from "lucide-react";

interface SearchProduct {
  id: string;
  name: { bs: string; en: string };
  slug: string;
  price: number;
  images: { url: string }[];
}

interface SearchCategory {
  id: string;
  name: { bs: string; en: string };
  slug: string;
}

interface SearchResults {
  products: SearchProduct[];
  categories: SearchCategory[];
}

export function PredictiveSearch({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const getLocal = useCallback(
    (name: { bs: string; en: string }) => name[locale as "bs" | "en"] || name.bs || name.en,
    [locale]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (path: string) => {
    setQuery("");
    setOpen(false);
    onClose?.();
    router.push(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults =
    results &&
    (results.products.length > 0 || results.categories.length > 0);

  return (
    <div className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={t("common.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results && query.trim().length >= 2) setOpen(true);
          }}
          className="pl-10 pr-10"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </form>

      {/* Dropdown results */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50"
        >
          {hasResults ? (
            <div className="py-2">
              {/* Categories */}
              {results!.categories.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("common.categories")}
                  </p>
                  {results!.categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                      onClick={() => navigateTo(`/categories/${cat.slug}`)}
                    >
                      {getLocal(cat.name)}
                    </button>
                  ))}
                </div>
              )}

              {/* Products */}
              {results!.products.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("common.products")}
                  </p>
                  {results!.products.map((product) => (
                    <button
                      key={product.id}
                      className="w-full text-left flex items-center gap-3 px-2 py-2 rounded hover:bg-muted transition-colors"
                      onClick={() =>
                        navigateTo(`/products/${product.slug}`)
                      }
                    >
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {getLocal(product.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View all results */}
              <div className="border-t mt-2 pt-2 px-3">
                <button
                  className="w-full text-center text-sm text-primary hover:underline py-1"
                  onClick={() =>
                    navigateTo(
                      `/search?q=${encodeURIComponent(query.trim())}`
                    )
                  }
                >
                  {t("common.viewAllResults")}
                </button>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t("common.noResults")}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
