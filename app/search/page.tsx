'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

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

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const [movies, setMovies] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    tmdb('/search/multi', { query: q, page: '1' }).then(data => {
      const results = data.results || []
      setMovies(results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 12))
      setPeople(results.filter((r: any) => r.media_type === 'person').slice(0, 8))
      setLoading(false)
    })
  }, [q])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
        <button onClick={() => router.back()} className="back-btn">← 돌아가기</button>
        <span>"{q}" 검색 결과</span>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><br />검색 중...</div>
      ) : (
        <>
          {movies.length > 0 && (
            <>
              <div className="section-label">영화·드라마</div>
              <div className="movie-grid" style={{ marginBottom: '32px' }}>
                {movies.map(m => (
                  <div key={m.id} className="movie-card" onClick={() => router.push(`/${m.media_type}/${m.id}`)}>
                    {m.poster_path
                      ? <img src={imgSrc(m.poster_path)!} alt={m.title || m.name} loading="lazy" />
                      : <div className="no-img"><span>{m.title || m.name}</span></div>
                    }
                    <div className="movie-card-info">
                      <div className="movie-card-title">{m.title || m.name}</div>
                      <div className="movie-card-year">{(m.release_date || m.first_air_date || '').slice(0,4)} · {m.media_type === 'tv' ? '드라마' : '영화'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {people.length > 0 && (
            <>
              <div className="section-label">배우·인물</div>
              <div className="actor-grid" style={{ marginBottom: '32px' }}>
                {people.map(p => (
                  <div key={p.id} className="actor-grid-card" onClick={() => router.push(`/actor/${p.id}`)}>
                    {p.profile_path
                      ? <img src={imgSrc(p.profile_path, 'w185')!} alt={p.name} loading="lazy" />
                      : <div className="av-block">{(p.name || '').slice(0,1)}</div>
                    }
                    <div className="actor-grid-info"><div className="actor-grid-name">{p.name}</div></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {movies.length === 0 && people.length === 0 && (
            <div className="post-empty">검색 결과가 없어요.</div>
          )}