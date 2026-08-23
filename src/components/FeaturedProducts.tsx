// ... (bagian atas tetap sama)

  const fetchProductsAndStore = async () => {
    setLoading(true);

    // Tambahkan timestamp agar data selalu fresh (anti-cache)
    const timestamp = new Date().getTime();
    
    const storeQuery = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
      "shopee": coalesce(shopee, shopeeUrl, ""),
      "facebook": coalesce(facebook, "")
    }`);

    const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee, order, sortOrder, urutan,
      isFeatured, featured,
      "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    for (const id of PROJECT_IDS) {
      try {
        const storeRes = await fetch(
          `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${storeQuery}&t=${timestamp}`,
          { cache: 'no-store' }
        );
        const storeData = await storeRes.json();
        
        // LOGIKA PINTAR: Jika kolom shopee kosong, intip kolom Facebook
        let foundShopee = storeData?.result?.shopee;
        const fbLink = storeData?.result?.facebook;

        if (!foundShopee && fbLink && (fbLink.includes('shopee') || fbLink.includes('sh.ee'))) {
          foundShopee = fbLink;
        }

        if (foundShopee) setGlobalShopee(fixLink(foundShopee));

        // ... (sisanya tetap sama)
