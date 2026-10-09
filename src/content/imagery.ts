/** Editorial imagery per sector. These are illustrative, not photos of Moasis users or verified Omani locations. */
const bySector: Record<string, string> = {
  cafe: "/images/vision/cafe-architecture.webp",
  restaurant: "/images/fieldwork/coffee-counter.webp",
  retail: "/images/storefront.webp",
  studio: "/images/fieldwork/pottery-workshop.webp",
  manufacturing: "/images/fieldwork/pottery-workshop.webp",
  events: "/images/vision/coffee-kiosk.webp",
};
export const sectorImage = (id: string) => bySector[id] ?? "/images/fieldwork/planning-workspace.webp";
export const pathImages = ["/images/financial-foundations.webp", "/images/founder-studio.webp", "/images/people-leadership.webp"];
