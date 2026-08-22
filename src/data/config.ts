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
    // ==========================================
    // 🧡 ISIAN SHOPEE & TOKOPEDIA LENGKAP
    // ==========================================
    {
      name: 'shopee',
      title: 'Link Shopee Official Store',
      type: 'string',
      description: 'Contoh: https://shopee.co.id/tokofitnesssurabaya',
    },
    {
      name: 'tokopedia',
      title: 'Link Tokopedia Store',
      type: 'string',
      description: 'Contoh: https://tokopedia.com/tokofitnesssurabaya',
    },
    // ==========================================
    {
      name: 'facebook',
      title: 'Facebook',
      type: 'string',
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
