'use client'
import { useEffect, useState } from 'react'

interface BoxOfficeMovie {
  rank: string
  movieNm: string
  openDt: string
  audiAcc: string
}

interface TMDBMovie {
  id: number
  title?: string
  name?: string
  poster_path: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type: string
}

export default function NowPage() {
  const [boxOffice, setBoxOffice] = useState<BoxOfficeMovie[]>([])
  const [ottMovies, setOttMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // KOBIS 박스오피스 (API Route 경유)
        const kobisRes = await fetch('/api/boxoffice')
        const kobisData = await kobisRes.json()
        setBoxOffice(kobisData.boxOfficeResult?.dailyBoxOfficeList || [])

        // TMDB 한국 콘텐츠 위주
const [movieRes, tvRes] = await Promise.all([
  fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ko-KR`),
  fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ko-KR`)
])
const movieData = await movieRes.json()
const tvData = await tvRes.json()

const combined = [
...(movieData.results || []).filter((m: any) => m.original_language === 'ko').slice(0, 8).map((m: any) => ({ ...m, media_type: 'movie' })),
...(tvData.results || []).filter((t: any) => t.original_language === 'ko').slice(0, 8).map((t: any) => ({ ...t, media_type: 'tv' }))
].sort((a, b) => b.popularity - a.popularity).slice(0, 10)

        setOttMovies(combined)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="now-loading">불러오는 중...</div>

  return (
    <div className="now-container">
      <h1 className="now-title">요즘 볼만한 거</h1>
      <div className="now-grid">
        {/* 영화관 */}
        <div className="now-section">
          <h2 className="now-section-title">🎬 영화관</h2>
          {boxOffice.map((movie, i) => (
            <div key={i} className="now-card">
<div className="now-card-poster-wrap">
  <span className="now-rank-badge">No.{movie.rank}</span>
  {(movie as any).poster_path ? (
    <img
      src={`https://image.tmdb.org/t/p/w300${(movie as any).poster_path}`}
      alt={movie.movieNm}
      className="now-card-poster"
    />
  ) : (
    <div className="now-card-poster-empty" />
  )}
</div>
              <div className="now-info">
                <div className="now-movie-title">
                  {movie.movieNm.length > 15 ? movie.movieNm.slice(0, 15) + '…' : movie.movieNm}
                </div>
                <div className="now-meta">개봉일 {movie.openDt}</div>
                <div className="now-meta">누적관객 {Number(movie.audiAcc).toLocaleString()}명</div>
              </div>
            </div>
          ))}
        </div>

        {/* OTT */}
        <div className="now-section">
          <h2 className="now-section-title">📺 OTT</h2>
          {ottMovies.map((movie, i) => (
            <div key={i} className="now-card">
              <div className="now-card-poster-wrap">
                <span className="now-rank-badge">No.{i + 1}</span>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="now-card-poster"
                  />
                ) : (
                  <div className="now-card-poster-empty" />
                )}
                <span className="now-media-badge">
                  {movie.media_type === 'movie' ? '영화' : '드라마'}
                </span>
              </div>
              <div className="now-info">
                <div className="now-movie-title">
                  {(movie.title || movie.name || '').length > 15
                    ? (movie.title || movie.name || '').slice(0, 15) + '…'
                    : (movie.title || movie.name)}
                </div>
                <div className="now-meta">⭐ {movie.vote_average.toFixed(1)}</div>
                <div className="now-meta">{movie.release_date || movie.first_air_date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}