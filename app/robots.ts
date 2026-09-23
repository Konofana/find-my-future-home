import type { MetadataRoute } from 'next'

export default function robots():MetadataRoute.Robots{
 return {rules:[{userAgent:'*',allow:'/',disallow:['/account','/saved','/landlord/']}],sitemap:'https://find-my-future-home-6228.vercel.app/sitemap.xml'}
}
