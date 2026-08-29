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
  // null = SEMUA TERTUTUP SEJAK AWAL
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-gray-50 py-16 px-4" id="faq">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            FAQ
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Pertanyaan yang sering diajukan seputar Toko Fitness Surabaya
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-red-300 transition"
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

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}