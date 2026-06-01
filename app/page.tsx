'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const IMG = 'https://image.tmdb.org/t/p/'

async function tmdb(path: string, params: Record<string, string> = {}) {
  const p = new URLSearchParams({ api_key: API_KEY!, language: 'ko-KR', ...params })
  const res = await fetch(`https://api.themoviedb.org/3${path}?${p}`)
  return res.json()
}

function imgSrc(path: string | null, size = 'w342') {
  return path ? IMG + size + path : null
}

export default function Home() {
  const router = useRouter()
  const [actors, setActors] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loadingActors, setLoadingActors] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)
  const searchTimer = useRef<any>(null)

  useEffect(() => {
    loadActors()
    loadMovies()
  }, [])

  async function loadActors() {
    try {
      const data = await tmdb('/discover/movie', { with_original_language: 'ko', sort_by: 'popularity.desc', page: '1' })
      const krMovies = (data.results || []).filter((m: any) => m.original_language === 'ko').slice(0, 5)
      const credits = await Promise.all(krMovies.map((m: any) => tmdb(`/movie/${m.id}/credits`).catch(() => ({ cast: [] }))))
      const countMap: Record<number, number> = {}
      const infoMap: Record<number, any> = {}
      credits.forEach((cr: any) => {
        (cr.cast || []).slice(0, 20).forEach((a: any) => {
          if (!a.profile_path) return
          countMap[a.id] = (countMap[a.id] || 0) + 1
          if (!infoMap[a.id]) infoMap[a.id] = a
        })
      })
      const top = Object.entries(countMap).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 8).map(([id]) => infoMap[Number(id)]).filter(Boolean)
      setActors(top)
    } finally {
      setLoadingActors(false)
    }
  }

  async function loadMovies() {
    try {
      const cutoff = '2025-01-01'
      const [mv, tv] = await Promise.all([
        tmdb('/discover/movie', { with_original_language: 'ko', sort_by: 'popularity.desc', 'primary_release_date.gte': cutoff, page: '1' }),
        tmdb('/discover/tv', { with_original_language: 'ko', sort_by: 'popularity.desc', with_genres: '18', 'first_air_date.gte': cutoff, page: '1' })
      ])
      const all = [
        ...(mv.results || []).filter((m: any) => m.original_language === 'ko').slice(0, 5).map((m: any) => ({ ...m, _type: 'movie', _title: m.title, _date: m.release_date })),
        ...(tv.results || []).filter((d: any) => d.original_language === 'ko').slice(0, 5).map((d: any) => ({ ...d, _type: 'tv', _title: d.name, _date: d.first_air_date }))
      ].sort((a, b) => b.popularity - a.popularity).slice(0, 8)
      setMovies(all)
    } finally {
      setLoadingMovies(false)
    }
  }

  function onSearchInput(q: string) {
    setSearchQuery(q)
    clearTimeout(searchTimer.current)
    if (!q.trim()) { setDropdownOpen(false); return }
    searchTimer.current = setTimeout(async () => {
      const data = await tmdb('/search/multi', { query: q, page: '1' })
      setSearchResults(data.results || [])
      setDropdownOpen(true)
    }, 300)
  }

  function doSearch() {
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setDropdownOpen(false)
  }

  return (
    <>
      <div className="home-hero">
        <h1 style={{ fontWeight: 900 }}>Actor who?</h1>
        <p className="tagline">그 배우, 전에 어디서 봤더라?</p>
        <p className="subtitle">Actor-Wiki by Qho</p>
        <div className="home-search-wrap">
          <div className="home-search-input-wrap">
            <span className="home-search-icon">🔍</span>
            <input
              type="text"
              placeholder="작품명, 배우명 검색..."
              value={searchQuery}
              onChange={e => onSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            {dropdownOpen && searchResults.length > 0 && (
              <div className="search-dropdown open">
                {searchResults.filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 4).map(m => (
                  <div key={m.id} className="search-item" onClick={() => { router.push(`/${m.media_type}/${m.id}`); setDropdownOpen(false); setSearchQuery('') }}>
                    {m.poster_path ? <img src={imgSrc(m.poster_path, 'w92')!} alt="" /> : <div className="si-img-placeholder" />}
                    <div><div className="si-title">{m.title || m.name}</div><div className="si-sub">{(m.release_date || m.first_air_date || '').slice(0,4)} · {m.media_type === 'tv' ? '드라마' : '영화'}</div></div>
                  </div>
                ))}
                {searchResults.filter(r => r.media_type === 'person').slice(0, 3).map(p => (
                  <div key={p.id} className="search-item" onClick={() => { router.push(`/actor/${p.id}`); setDropdownOpen(false); setSearchQuery('') }}>
                    {p.profile_path ? <img src={imgSrc(p.profile_path, 'w92')!} alt={p.name} /> : <div className="si-img-placeholder" />}
                    <div><div className="si-title">{p.name}</div><div className="si-sub">배우</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="home-search-btn" onClick={doSearch}>검색</button>
        </div>
      </div>

      <div className="home-content">
        <div className="section-label">요즘 많이 보이는 배우</div>
        {loadingActors ? (
          <div className="loading"><div className="spinner" /><br />불러오는 중...</div>
        ) : (
          <div className="actor-grid">
            {actors.map(a => (
              <div key={a.id} className="actor-grid-card" onClick={() => router.push(`/actor/${a.id}`)}>
                <img src={imgSrc(a.profile_path, 'w185')!} alt={a.name} loading="lazy" />
                <div className="actor-grid-info"><div className="actor-grid-name">{a.name}</div></div>
              </div>
            ))}
          </div>
        )}

        <div className="section-label">작품 TOP 10</div>
        {loadingMovies ? (
          <div className="loading"><div className="spinner" /><br />불러오는 중...</div>
        ) : (
          <div className="movie-grid">
            {movies.map(item => (
              <div key={item.id} className="movie-card" onClick={() => router.push(`/${item._type}/${item.id}`)}>
                {item.poster_path
                  ? <img src={imgSrc(item.poster_path)!} alt={item._title} loading="lazy" />
                  : <div className="no-img"><span>{item._title}</span></div>
                }
                <div className="movie-card-info">
                  <div className="movie-card-title">{item._title}</div>
                  <div className="movie-card-year">{(item._date || '').slice(0,4)} · {item._type === 'tv' ? '드라마' : '영화'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}