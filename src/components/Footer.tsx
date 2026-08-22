{/* Di bagian Footer / Kontak */}
<div className="space-y-2">
  <div className="flex items-center gap-2 text-gray-400 text-sm">
    <span>📞 Admin 1:</span>
    <a href={`https://wa.me/${STORE_CONFIG.phone}`} target="_blank" className="text-white hover:text-red-500 font-bold">
      +{STORE_CONFIG.phone}
    </a>
  </div>

  <div className="flex items-center gap-2 text-gray-400 text-sm">
    <span>📞 Admin 2:</span>
    <a href={`https://wa.me/${(STORE_CONFIG as any).phone2}`} target="_blank" className="text-white hover:text-red-500 font-bold">
      +{(STORE_CONFIG as any).phone2}
    </a>
  </div>
</div>
