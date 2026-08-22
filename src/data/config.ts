export default {
  name: 'storeConfig',
  title: 'Info Toko',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nama Toko',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Deskripsi Toko',
      type: 'text',
    },
    {
      name: 'logo',
      title: 'Logo Toko',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'phone',
      title: 'Nomor Telepon / WhatsApp',
      type: 'string',
    },
    // 🧡 KITA TAMBAHKAN KOLOM SHOPEE DI SINI
    {
      name: 'shopee',
      title: 'Link Shopee Official Store',
      type: 'url',
      description: 'Masukkan link toko Shopee Anda (Contoh: https://shopee.co.id/tokofitnesssurabaya)',
    },
    {
      name: 'tokopedia',
      title: 'Link Tokopedia',
      type: 'url',
      description: 'Masukkan link toko Tokopedia Anda',
    },
    {
      name: 'tiktok',
      title: 'TikTok',
      type: 'string',
    },
    {
      name: 'youtube',
      title: 'YouTube',
      type: 'string',
    },
    {
      name: 'maps',
      title: 'Link Google Maps',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Alamat Lengkap Toko',
      type: 'text',
    },
  ],
};
