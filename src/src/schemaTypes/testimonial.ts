export default {
  name: 'testimonial',
  title: 'Testimonial / Ulasan',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nama Pembeli',
      type: 'string',
      description: 'Contoh: Budi Santoso',
    },
    {
      name: 'role',
      title: 'Status / Profesi',
      type: 'string',
      description: 'Contoh: Pemilik Gym / Ibu Rumah Tangga / Personal Trainer',
    },
    {
      name: 'content',
      title: 'Isi Ulasan / Testimoni',
      type: 'text',
      description: 'Kata-kata kepuasan pembeli tentang produk/layanan Anda',
    },
    {
      name: 'rating',
      title: 'Rating Bintang (1 - 5)',
      type: 'number',
      initialValue: 5,
    },
    {
      name: 'image',
      title: 'Foto Pembeli / Barang Diterima',
      type: 'image',
      options: { hotspot: true },
    },
  ],
};
