"use client";
import {
  Barbell, Car, Coffee, Compass, Confetti, Factory, ForkKnife, GraduationCap, Laptop, Palette, Scissors, ShoppingBag, Sparkle, Storefront, Truck, Wrench,
  type Icon,
} from "@phosphor-icons/react";

/** Maps the original Lucide-style sector icon names to the Phosphor family used throughout. */
const sectorIcons: Record<string, Icon> = {
  Coffee, Utensils: ForkKnife, Store: Storefront, ShoppingBag, Scissors, Dumbbell: Barbell, Wrench, Palette, Laptop, GraduationCap, Compass, Truck, Car, PartyPopper: Confetti, Factory, Sparkles: Sparkle,
};

export function SectorIcon({ name, size = 22, weight = "regular" }: { name: string; size?: number; weight?: "regular" | "duotone" | "fill" | "light" }) {
  const I = sectorIcons[name] ?? Sparkle;
  return <I size={size} weight={weight} aria-hidden="true" />;
}
