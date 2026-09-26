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
      name: 'shopee',
      title: 'Link Shopee Official Store',
      type: 'string',
      description: 'Masukkan link toko Shopee publik (Contoh: https://shopee.co.id/fitnesssurabaya)',
    },
    {
      name: 'lazada',
      title: 'Link Lazada Official Store',
      type: 'string',
      description: 'Masukkan link TOKO PUBLIK Lazada (contoh: https://www.lazada.co.id/shop/nama-toko). Jangan pakai sellercenter.',
    },
    {
      name: 'tokopedia',
      title: 'Link Tokopedia',
      type: 'string',
      description: 'Opsional. Isi jika toko Tokopedia sudah aktif.',
    },
    {
      name: 'facebook',
      title: 'Facebook',
      type: 'string',
    },
    {
      name: 'tiktok',
      title: 'TikTok Shop',
      type: 'string',
      description: 'Opsional. Isi jika TikTok Shop sudah aktif.',
    },
    {
      name: 'youtube',
      title: 'YouTube',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Nomor Telepon / WhatsApp',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Alamat',
      type: 'text',
    },
  ],
};
