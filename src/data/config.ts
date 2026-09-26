export const STORE_CONFIG = {
  name: "TOKO FITNESS SURABAYA",
  logo: "",
  slogan: "Kualitas Gym Profesional Di Rumah Anda",
  phone: "6281332345448, 6281235907956",
  phone2: "6281235907956",
  email: "dwisulistya22@gmail.com",
  address: "Jl. Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya, Jawa Timur 60216",
  shopee: "https://shopee.co.id/fitnesssurabaya",
  // Link publik toko Lazada (bukan sellercenter). Sesuaikan slug toko jika berbeda.
  lazada: "https://www.lazada.co.id/shop/vyokhg3h",
  tokopedia: "",
  tiktok: "",
  hero: {
    title: "KUALITAS GYM PROFESIONAL DI RUMAH ANDA",
    subtitle: "Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.",
    tag: "PROMO CUCI GUDANG 2024"
  }
};

export type MarketplaceId = "shopee" | "lazada" | "tokopedia" | "tiktok";

export type MarketplaceConfig = {
  id: MarketplaceId;
  name: string;
  label: string;
  url: string;
  live: boolean;
  description: string;
};

export const MARKETPLACES: MarketplaceConfig[] = [
  {
    id: "shopee",
    name: "Shopee",
    label: "Shopee Official",
    url: STORE_CONFIG.shopee,
    live: true,
    description: "Voucher, flash sale, dan cicilan Shopee. Toko resmi Toko Fitness Surabaya.",
  },
  {
    id: "lazada",
    name: "Lazada",
    label: "Lazada Official",
    url: STORE_CONFIG.lazada,
    live: true,
    description: "Belanja alat gym di Lazada. Promo platform, COD, dan pengiriman ke seluruh Indonesia.",
  },
  {
    id: "tokopedia",
    name: "Tokopedia",
    label: "Tokopedia",
    url: STORE_CONFIG.tokopedia,
    live: false,
    description: "Toko Tokopedia sedang disiapkan. Chat WhatsApp untuk order atau cek stok.",
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    label: "TikTok Shop",
    url: STORE_CONFIG.tiktok,
    live: false,
    description: "TikTok Shop segera hadir. Tanyakan live sale & paket promo via WhatsApp.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Budi Santoso",
    role: "Pemilik Gym Local",
    content: "Pelayanan Fitness Surabaya sangat memuaskan. Pengiriman cepat dan teknisinya sangat ahli dalam instalasi alat-alat berat.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=budi"
  },
  {
    name: "Siska Amelia",
    role: "Ibu Rumah Tangga",
    content: "Beli Treadmill di sini garansinya jelas. Sudah pakai 1 tahun masih awet dan lancar. Sangat membantu program diet saya!",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=siska"
  },
  {
    name: "dr. Andi Wijaya",
    role: "Personal Trainer",
    content: "Rekomendasi terbaik untuk alat fitness berkualitas di Jawa Timur. Barangnya ori dan harganya sangat kompetitif.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=andi"
  }
];

export const CATEGORIES = [
  { id: 'cardio', name: 'Cardio' },
  { id: 'strength', name: 'Strength' },
  { id: 'homegym', name: 'Home Gym' },
  { id: 'aksesoris', name: 'Aksesoris' }
];

export const PRODUCTS: any[] = [];
