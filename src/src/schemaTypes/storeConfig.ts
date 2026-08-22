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
      description: 'Masukkan link toko Shopee Anda (Contoh: https://id.sh.ee/PEdSUDy6)',
    },
    {
      name: 'tokopedia',
      title: 'Link Tokopedia',
      type: 'string',
    },
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
