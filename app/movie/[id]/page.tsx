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

export default function MoviePage() {
  const { id } = useParams()
  const router = useRouter()
  const [detail, setDetail] = useState<any>(null)
  const [credits, setCredits] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      tmdb(`/movie/${id}`),
      tmdb(`/movie/${id}/credits`),
      tmdb(`/movie/${id}/images`, { include_image_language: 'null,ko,en' })
    ]).then(([d, c, i]) => {
      setDetail(d)
      setCredits((c.cast || []).slice(0, 16))
      setImages((i.backdrops || []).slice(0, 8))
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="loading"><div className="spinner" /><br />불러오는 중...</div>
  if (!detail) return null

  const slides = [
    ...(detail.poster_path ? [{ type: 'poster', path: detail.poster_path }] : []),
    ...images.map(img => ({ type: 'still', path: img.file_path }))
  ]

  return (
    <div className="layout">
      <main>
        <button className="back-btn" onClick={() => router.back()}>← 돌아가기</button>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
          {slides.length > 0 && (
            <div style={{ position: 'relative', background: '#000', overflow: 'hidden' }}>
              <div style={{ display: 'flex', transition: 'transform .35s ease', transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((s, i) => (
                  <div key={i} style={{ minWidth: '100%' }}>
                    <img
                      src={imgSrc(s.path, s.type === 'poster' ? 'w500' : 'w780')!}
                      style={{ width: '100%', maxHeight: '380px', objectFit: s.type === 'poster' ? 'contain' : 'cover', display: 'block' }}
                      alt=""
                    />
                  </div>
                ))}
              </div>
              {slides.length > 1 && (
                <>
                  <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', fontSize: '20px', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer' }}>‹</button>
                  <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', fontSize: '20px', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer' }}>›</button>
                  <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                    {slides.map((_, i) => (
                      <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentSlide ? 'var(--gold)' : 'rgba(255,255,255,.35)', cursor: 'pointer' }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', borderRadius: '20px', marginBottom: '10px' }}>🎬 영화</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>{detail.title}</div>
            {detail.original_title !== detail.title && <div style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px', fontStyle: 'italic' }}>{detail.original_title}</div>}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {detail.release_date && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}><strong style={{ color: 'var(--text)' }}>{detail.release_date.slice(0,4)}</strong></div>}
              {detail.genres?.length > 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>장르 <strong style={{ color: 'var(--text)' }}>{detail.genres.map((g: any) => g.name).join(' · ')}</strong></div>}
              {detail.runtime && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>상영시간 <strong style={{ color: 'var(--text)' }}>{detail.runtime}분</strong></div>}
              {detail.vote_average > 0 && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>TMDB <strong style={{ color: 'var(--text)' }}>⭐ {detail.vote_average.toFixed(1)}</strong></div>}
            </div>
            {detail.overview && <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>{detail.overview}</div>}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <a className="ext-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', textDecoration: 'none' }} onClick={() => window.open(`https://namu.wiki/w/${encodeURIComponent(detail.title)}`, '_blank')}>📖 나무위키</a>
              <a className="ext-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', textDecoration: 'none' }} href={`https://search.naver.com/search.naver?query=${encodeURIComponent(detail.title + ' 영화')}`} target="_blank">🔍 네이버</a>
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
              <div key={c.id} onClick={() => router.push(`/actor/${c.id}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s' }}>
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