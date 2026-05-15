import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  // Use a string replace if the Intl library uses GTQ instead of Q
  const formatted = new Intl.NumberFormat('es-GT', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return `Q${formatted}`;
}
