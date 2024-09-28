import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shortenAddress = (address: string, chars = 6) => {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const trimString = (str: string, length: number = 25) => {
  return str.length > length ? `${str.slice(0, length)}...` : str;
};