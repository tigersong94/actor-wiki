import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'

export const metadata: Metadata = {
  title: '배우위키',
  description: '이 배우 어디서 봤더라? 배우 중심의 한국 영화·드라마 아카이브',
  openGraph: {
    title: '배우위키',
    description: '이 배우 어디서 봤더라?',
    url: 'https://actor-wiki-v2.vercel.app',
    siteName: '배우위키',
    images: [
      {
        url: 'https://actor-wiki-v2.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}