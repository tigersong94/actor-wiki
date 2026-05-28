'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

export default function TvPage() {
  const { id } = useParams()
  const router = useRouter()
  const [detail, setDetail] = useState<any>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [seasonDetail, setSeasonDetail] = useState<any>(null)
  const [credits, setCredits] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      tmdb(`/tv/${id}`),
      tmdb(`/tv/${id}/credits`),
      tmdb(`/tv/${id}/images`, { include_image_language: 'null,ko,en' })
    ]).then(([d, c, i]) => {
      setDetail(d)
      setCredits((c.cast || []).slice(0, 16))
      setImages((i.backdrops || []).slice(0, 6))
      const seasons = (d.seasons || []).filter((s: any) => s.season_number > 0)
      if (seasons.length === 1) setSelectedSeason(seasons[0].season_number)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!selectedSeason || !id) return
    tmdb(`/tv/${id}/season/${selectedSeason}`).then(s => setSeasonDetail(s))
  }, [selectedSeason, id])

  if (loading) return <div className="loading"><div className="spinner" /><br />불러오는 중...</div>
  if (!detail) return null

  const seasons = (detail.seasons || []).filter((s: any) => s.season_number > 0)
  const posterPath = seasonDetail?.poster_path || detail.poster_path
  const slides = [
    ...(posterPath ? [{ type: 'poster', path: posterPath }] : []),
    ...images.map(img => ({ type: 'still', path: img.file_path }))
  ]
  const title = selectedSeason && seasons.length > 1 ? `${detail.name} 시즌${selectedSeason}` : detail.name

  return (
    <div className="layout">
      <main>
        <button className="back-btn" onClick={() => router.back()}>← 돌아가기</button>

        {/* 시즌 여러 개면 선택 화면 먼저 */}
        {seasons.length > 1 && !selectedSeason && (
          <>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>{detail.name}</div>
              {detail.overview && <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>{detail.overview}</div>}
            </div>
            <div className="section-label">시즌 선택</div>
            <div className="movie-grid">
              {seasons.map((s: any) => (
                <div key={s.season_number} className="movie-card" onClick={() => setSelectedSeason(s.season_number)}>
                  {s.poster_path || detail.poster_path
                    ? <img src={imgSrc(s.poster_path || detail.poster_path)!} alt={`시즌${s.season_number}`} loading="lazy" />
                    : <div className="no-img"><span>시즌{s.season_number}</span></div>
                  }
                  <div className="movie-card-info">
                    <div className="movie-card-title">시즌 {s.season_number}</div>
                    <div className="movie-card-year">{(s.air_date || '').slice(0,4)} · {s.episode_count}화</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 시즌 선택됐거나 1개면 상세 */}
        {(selectedSeason || seasons.length <= 1) && (
          <>
            {seasons.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {seasons.map((s: any) => (
                  <div key={s.season_number} onClick={() => { setSelectedSeason(s.season_number); setCurrentSlide(0) }} style={{ background: selectedSeason === s.season_number ? 'rgba(201,168,76,.15)' : 'var(--surface2)', border: `1px solid ${selectedSeason === s.season_number ? 'var(--gold)' : 'var(--border)'}`, color: selectedSeason === s.season_number ? 'var(--gold)' : 'var(--text-muted)', fontSize: '12px', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer' }}>
                    시즌 {s.season_number}
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
              {slides.length > 0 && (
                <div style={{ position: 'relative', background: '#000' }}>
                  <div style={{ display: 'flex', transition: 'transform .35s ease', transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((s, i) => (
                      <div key={i} style={{ minWidth: '100%' }}>
                        <img src={imgSrc(s.path, s.type === 'poster' ? 'w500' : 'w780')!} style={{ width: '100%', maxHeight: '380px', objectFit: s.type === 'poster' ? 'contain' : 'cover', display: 'block' }} alt="" />
                      </div>
                    ))}
                  </div>
                  {slides.length > 1 && (
                    <>
                      <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', fontSize: '20px', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer' }}>‹</button>
                      <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', fontSize: '20px', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer' }}>›</button>
                      <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                        {slides.map((_, i) => <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentSlide ? 'var(--gold)' : 'rgba(255,255,255,.35)', cursor: 'pointer' }} />)}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'inline-block', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', borderRadius: '20px', marginBottom: '10px' }}>📺 드라마</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 700, marginBottom: '12px' }}>{title}</div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {(seasonDetail?.air_date || detail.first_air_date) && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}><strong style={{ color: 'var(--text)' }}>{(seasonDetail?.air_date || detail.first_air_date).slice(0,4)}</strong></div>}
                  {detail.genres?.length > 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>장르 <strong style={{ color: 'var(--text)' }}>{detail.genres.map((g: any) => g.name).join(' · ')}</strong></div>}
                  {seasonDetail?.episodes?.length && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>에피소드 <strong style={{ color: 'var(--text)' }}>{seasonDetail.episodes.length}화</strong></div>}
                  {detail.vote_average > 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>TMDB <strong style={{ color: 'var(--text)' }}>⭐ {detail.vote_average.toFixed(1)}</strong></div>}
                </div>
                {(seasonDetail?.overview || detail.overview) && <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>{seasonDetail?.overview || detail.overview}</div>}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <a style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', textDecoration: 'none' }} onClick={() => window.open(`https://namu.wiki/w/${encodeURIComponent(title)}`, '_blank')}>📖 나무위키</a>
                  <a style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', textDecoration: 'none' }} href={`https://search.naver.com/search.naver?query=${encodeURIComponent(title + ' 드라마')}`} target="_blank">🔍 네이버</a>
                </div>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
              <button style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--gold)', color: 'var(--gold)', fontFamily: 'Noto Sans KR', fontSize: '13px', fontWeight: 500, padding: '10px 18px', cursor: 'pointer', marginBottom: '-1px' }}>캐스팅</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
              {credits.map(c => {
                const ko = /[가-힣]/.test(c.character || '')
                return (
                  <div key={c.id} onClick={() => router.push(`/actor/${c.id}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer' }}>
                    {c.profile_path
                      ? <img src={imgSrc(c.profile_path, 'w185')!} alt={c.name} loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                      : <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'rgba(255,255,255,.15)' }}>{(c.name || '').slice(0,2)}</div>
                    }
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      {c.character && <div style={{ fontSize: '11px', color: ko ? 'var(--gold-light)' : 'var(--text-dim)', fontStyle: ko ? 'normal' : 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.character}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
      <aside>
        <div className="sidebar-block">
          <div className="sidebar-title">관련 게시글</div>
          <ul className="sidebar-list">
            <li style={{ color: 'var(--text-dim)', fontSize: '12px' }}>게시글이 없습니다</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}