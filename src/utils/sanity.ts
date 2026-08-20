import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: '856jrik3',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  if (!source) return ''
  try {
    return builder.image(source).width(800).url()
  } catch {
    return ''
  }
}

export async function getAllCategories() {
  const data = await sanityClient.fetch(
    `*[_type == "category"] | order(order asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      order,
      "image": image.asset->url
    }`
  )
  return data || []
}

export async function getAllProducts() {
  const data = await sanityClient.fetch(
    `*[_type == "product"] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      price,
      discountPrice,
      description,
      stock,
      rating,
      featured,
      "image": image.asset->url,
      "category": category->name
    }`
  )
  return data || []
}

export async function getFeaturedProducts() {
  const data = await sanityClient.fetch(
    `*[_type == "product" && featured == true] | order(_createdAt desc)[0...8] {
      _id,
      name,
      "slug": slug.current,
      price,
      discountPrice,
      description,
      stock,
      rating,
      featured,
      "image": image.asset->url,
      "category": category->name
    }`
  )
  return data || []
}

export async function getStoreInfo() {
  const data = await sanityClient.fetch(
    `*[_type == "storeConfig"][0]{
      name,
      slogan,
      phone,
      email,
      address,
      "logo": logo.asset->url
    }`
  )
  return data || null
}

export async function getHeroBanner() {
  const data = await sanityClient.fetch(
    `*[_type == "slider" && active == true] | order(order asc)[0]{
      title,
      subtitle,
      promoTag,
      ctaText,
      ctaLink,
      "image": image.asset->url
    }`
  )
  return data || null
}
