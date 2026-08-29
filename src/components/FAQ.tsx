import { useState } from "react";

const faqs = [
  {
    question: "Apakah produk ready stok di Surabaya?",
    answer:
      "Ya, sebagian besar produk ready stok di gudang Surabaya. Untuk ketersediaan terbaru, silakan hubungi kami via WhatsApp.",
  },
  {
    question: "Apakah bisa kirim ke luar kota?",
    answer:
      "Bisa. Kami melayani pengiriman ke Sidoarjo, Gresik, Malang, Jakarta, dan seluruh Indonesia via ekspedisi terpercaya.",
  },
  {
    question: "Apakah ada jasa pasang di rumah?",
    answer:
      "Tersedia jasa instalasi/pasang onsite khusus area Surabaya, Sidoarjo, dan Gresik. Di luar area tersebut bisa diatur sesuai kesepakatan.",
  },
  {
    question: "Berapa lama garansi produk?",
    answer:
      "Semua produk bergaransi resmi 1 tahun (syarat & ketentuan berlaku). Kerusakan karena salah pemakaian tidak ditanggung garansi.",
  },
  {
    question: "Apakah produk original?",
    answer:
      "Ya, kami hanya menjual produk original dan berkualitas. Dilengkapi garansi resmi toko.",
  },
  {
    question: "Bisa bayar COD atau DP?",
    answer:
      "Bisa. Tersedia opsi DP, pelunasan sebelum kirim, transfer bank, dan COD untuk area tertentu di Surabaya.",
  },
  {
    question: "Apakah harga di website sama dengan di Shopee?",
    answer:
      "Harga bisa berbeda karena ada promo platform. Untuk harga terbaik dan paket lengkap (termasuk ongkir/pasang), hubungi kami langsung.",
  },
  {
    question: "Apakah ada showroom yang bisa dikunjungi?",
    answer:
      "Silakan hubungi kami via WhatsApp untuk konfirmasi alamat showroom/gudang dan jadwal kunjungan.",
  },
];

export default function FAQ() {
  // false = Seluruh FAQ tersembunyi sejak awal
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-gray-50 py-8 px-4" id="faq">
      <div className="max-w-2xl mx-auto">
        {/* TOMBOL UTAMA FAQ (Hanya ini yang tampil pertama kali) */}
        <button
          onClick={() => setIsSectionOpen(!isSectionOpen)}
          className="w-full bg-white border border-gray-200 hover:border-red-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between group"
        >
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-red-600 transition">
              FAQ (Pertanyaan Umum)
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              {isSectionOpen
                ? "Klik untuk menyembunyikan pertanyaan"
                : "Klik di sini untuk melihat pertanyaan yang sering diajukan"}
            </p>
          </div>

          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              isSectionOpen
                ? "bg-red-600 text-white rotate-180"
                : "bg-gray-100 text-gray-700 group-hover:bg-red-100 group-hover:text-red-600"
            }`}
          >
            ↓
          </div>
        </button>

        {/* DAFTAR PERTANYAAN (Hanya muncul jika Tombol Utama FAQ diklik) */}
        {isSectionOpen && (
          <div className="mt-4 space-y-3 transition-all duration-300">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-900 text-sm md:text-base pr-3">
                      {faq.question}
                    </span>

                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-base font-bold flex-shrink-0 transition ${
                        isOpen
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}