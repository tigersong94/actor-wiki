'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  return (
    <>
      <header>
        <div className="header-inner">
          <Link href="/" className="logo">배위</Link>
          <nav className="header-nav">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>홈</Link>
            <Link href="/community" className={pathname === '/community' ? 'active' : ''}>커뮤니티</Link>
          </nav>
        </div>
      </header>
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          <Link href="/" className={`mobile-nav-btn ${pathname === '/' ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>홈
          </Link>
          <Link href="/community" className={`mobile-nav-btn ${pathname === '/community' ? 'active' : ''}`}>
            <span className="nav-icon">💬</span>커뮤니티
          </Link>
        </div>
      </nav>
    </>
  )
}