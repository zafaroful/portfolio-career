import { getBadgeVariant } from "@/lib/utils";

export function getExpiryStatus(expiryDate: string | null) {
  if (!expiryDate) {
    return { label: "No expiry", variant: getBadgeVariant("secondary") };
  }

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (expiry < now) {
    return { label: "Expired", variant: getBadgeVariant("expired") };
  }

  const days = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (days <= 30) {
    return { label: "Expiring soon", variant: getBadgeVariant("expiring soon") };
  }

  if (days <= 90) {
    return { label: "Expiring", variant: getBadgeVariant("expiring") };
  }

  return { label: "Valid", variant: getBadgeVariant("valid") };
}
