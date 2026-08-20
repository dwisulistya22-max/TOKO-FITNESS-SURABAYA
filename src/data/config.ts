export const STORE_CONFIG = {
  name: "TOKO FITNESS SURABAYA",
  logo: "https://i.ibb.co/Lhb85T8/Surabaya-Fitness-Logo.jpg?v=2",
  slogan: "Kualitas Gym Profesional, Di Rumah Anda",
  phone: "6281332345448",
  email: "dwisulistya22@gmail.com",
",
  address: "Jl. Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya, Jawa Timur 60216",
  hero: {
    title: "Kualitas Gym Profesional Di Rumah Anda",
    subtitle: "Dapatkan alat fitness berkualitas internasional untuk rumah maupun gym profesional. Toko Fitness Surabaya adalah mitra terpercaya Anda sejak 2010.",
    image: "/hero-bg-2.jpg",
    promoTag: "Promo Cuci Gudang 2024"
  }
};

export const CATEGORIES = [
  {
    id: 1,
    name: 'Cardio',
    image: '/category-treadmill.jpg',
    description: 'Treadmill, Sepeda Statis, Elliptical'
  },
  {
    id: 2,
    name: 'Strength',
    image: '/category-weights.jpg',
    description: 'Dumbbell, Barbell, Weight Plates'
  },
  {
    id: 3,
    name: 'Home Gym',
    image: '/hero-bg.jpg',
    description: 'Multi-gym, Smith Machine, Bench Press'
  },
  {
    id: 4,
    name: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
    description: 'Yoga Mat, Resistance Band, Roller'
  }
];

export type Category = typeof CATEGORIES[0];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Treadmill Elektrik T-100',
    price: 8450000,
    category: 'Cardio',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop',
    tag: 'Terlaris',
    description: 'Treadmill elektrik modern yang dirancang untuk penggunaan rumah tangga dengan motor bertenaga namun tetap senyap.',
    specs: 'Motor: 2.0HP DC | Kecepatan: 1-14km/h | Incline: Manual 3 Tingkat | Layar: LCD (Time, Speed, Distance, Calories, Pulse)'
  },
  {
    id: 2,
    name: 'Adjustable Dumbbell 24kg',
    price: 1950000,
    category: 'Strength',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?q=80&w=800&auto=format&fit=crop',
    tag: 'Baru'
  },
  {
    id: 3,
    name: 'Home Gym HG-3000 Multi Station',
    price: 12500000,
    category: 'Home Gym',
    rating: 5.0,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1594737625785-a6bad4b2ee8f?q=80&w=800&auto=format&fit=crop',
    tag: 'Premium'
  },
  {
    id: 4,
    name: 'Sepeda Statis S-20 Premium',
    price: 3750000,
    category: 'Cardio',
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    tag: ''
  }
];
