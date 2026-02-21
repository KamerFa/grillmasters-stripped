"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart.store";

export function CartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
