export const BANNER_URL = 
  "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1764642176/WhatsApp_Image_2025-12-01_at_9.07.34_PM_a3k3ob.jpg";

export const BULK_MIN_QTY = 6;
export const BULK_DISCOUNT = 0.1;
export const PLACEHOLDER_IMG = "https://placehold.co/800x800?text=Sin+Imagen";

export const SECTIONS_CONFIG = [
  {
    id: "ofertas",
    title: "Ofertas especiales",
    filter: (products) => products.filter((p) => p.enOferta && p.isActive !== false).slice(0, 8),
    link: "/ofertas",
    tag: "Oferta",
    badgeType: "oferta",
  },
  {
    id: "destacados",
    title: "Gorras destacadas",
    filter: (products) => products.filter((p) => p.destacado && p.isActive !== false).slice(0, 8),
    link: "/productos?filter=destacados",
    tag: "Destacado",
    badgeType: "destacado",
  },
  {
    id: "novedades",
    title: "Novedades",
    filter: (products) => [...products].sort((a, b) => b.id - a.id).filter(p => p.isActive !== false).slice(0, 8),
    link: "/productos?filter=novedades",
    tag: "Nuevo",
    badgeType: "destacado",
  },
  {
    id: "masComprados",
    title: "Productos más vendidos",
    filter: (products) => [...products]
      .filter(p => p.isActive !== false && (p.sales || 0) >= 1)
      .sort((a,b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 8),
    link: "/productos?filter=mas-vendidos",
    tag: "Más vendido",
    badgeType: "masvendido",
  },
  {
    id: "monastery",
    title: "Colección Monastery",
    filter: (products) => products.filter(p => p.categoria?.toUpperCase().includes('MONASTERY') && p.isActive !== false).slice(0, 8),
    link: "/productos?filter=monastery",
    tag: "Premium",
    badgeType: "destacado",
  },
  {
    id: "allProducts",
    title: "Todos nuestros productos",
    filter: (products) => products.filter((p) => p.isActive !== false),
    link: "/productos",
    showSeeAllCard: true,
  },
];