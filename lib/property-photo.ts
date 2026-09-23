export function propertyPhotoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fmfh-property-photos/${path.split('/').map(encodeURIComponent).join('/')}`
}
