'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header>
        <div className="header-inner">
          <Link href="/" className="logo">배위</Link>
          <nav className="header-nav">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>홈</Link>
            <Link href="/community" className={pathname === '/community' ? 'active' : ''}>커뮤니티</Link>
          </nav>
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
        </div>
      </header>

      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">배위</span>
          <button className="drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <nav className="drawer-nav">
          <Link href="/" onClick={() => setMenuOpen(false)}>🏠 홈</Link>
          <Link href="/community" onClick={() => setMenuOpen(false)}>💬 커뮤니티</Link>
<Link href="/now" onClick={() => setMenuOpen(false)}>📈 실시간 인기작</Link>
<div className="drawer-nav-item disabled">
  🎬 AI 닮은꼴 배우 Who? <span className="beta-badge">Beta</span>
</div>
        </nav>
        <div className="drawer-footer">
          ⚙️ 개인설정
        </div>
      </div>

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