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

export default function ActorPage() {
  const { id } = useParams()
  const router = useRouter()
  const [detail, setDetail] = useState<any>(null)
  const [filmography, setFilmography] = useState<any[]>([])
  const [stills, setStills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      tmdb(`/person/${id}`),
      tmdb(`/person/${id}/combined_credits`)
    ]).then(([d, c]) => {
      setDetail(d)
      const films = [...(c.cast || [])].sort((a, b) =>
        (b.release_date || b.first_air_date || '').localeCompare(a.release_date || a.first_air_date || '')
      ).slice(0, 30)
      setFilmography(films)
      const topFilms = [...(c.cast || [])].sort((a, b) =>
        (b.release_date || b.first_air_date || '').localeCompare(a.release_date || a.first_air_date || '')
      ).filter(f => f.poster_path).slice(0, 8)
      setStills(topFilms)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="loading"><div className="spinner" /><br />불러오는 중...</div>
  if (!detail) return null

  const koreanName = (detail.also_known_as || []).find((n: string) => /[가-힣]/.test(n)) || detail.name
  const age = detail.birthday ? new Date().getFullYear() - parseInt(detail.birthday) : null

  return (
    <div className="layout">
      <main>
        <button className="back-btn" onClick={() => router.back()}>← 돌아가기</button>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            {detail.profile_path
              ? <img src={imgSrc(detail.profile_path, 'w342')!} alt={koreanName} style={{ width: '130px', height: '170px', objectFit: 'cover', objectPosition: 'top', borderRadius: 'var(--radius)', display: 'block' }} />
              : <div style={{ width: '130px', height: '170px', background: 'var(--surface2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'rgba(255,255,255,.15)' }}>{koreanName.slice(0,2)}</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 700, marginBottom: '2px' }}>{koreanName}</div>
            {koreanName !== detail.name && <div style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)', fontSize: '15px', marginBottom: '14px', fontStyle: 'italic' }}>{detail.name}</div>}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <div><div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>{filmography.length}</div><div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>작품</div></div>
              {age && <div><div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>{age}</div><div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>나이</div></div>}
              {detail.birthday && <div><div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>{detail.birthday.slice(0,4)}</div><div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>출생</div></div>}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', textDecoration: 'none' }} onClick={() => window.open(`https://namu.wiki/w/${encodeURIComponent(koreanName)}`, '_blank')}>📖 나무위키</a>
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', textDecoration: 'none' }} href={`https://search.naver.com/search.naver?query=${encodeURIComponent(koreanName + ' 배우')}`} target="_blank">🔍 네이버</a>
            </div>
          </div>
        </div>

        {/* 출연작 포스터 */}
        {stills.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              출연작
              <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {stills.map((f, i) => (
                <div key={i} onClick={() => router.push(`/${f.media_type === 'tv' ? 'tv' : 'movie'}/${f.id}`)}
                  style={{ cursor: 'pointer', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'border-color .2s' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <img
                    src={`${IMG}w185${f.poster_path}`}
                    alt={f.title || f.name}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          <button style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--gold)', color: 'var(--gold)', fontFamily: 'Noto Sans KR', fontSize: '13px', fontWeight: 500, padding: '10px 18px', cursor: 'pointer', marginBottom: '-1px' }}>필모그래피</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['연도', '작품', '역할', '유형'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '10px 12px', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filmography.map(f => {
              const year = (f.release_date || f.first_air_date || '').slice(0, 4)
              const isTV = f.media_type === 'tv'
              const ko = /[가-힣]/.test(f.character || '')
              return (
                <tr key={`${f.id}-${f.credit_id}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{year || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span onClick={() => router.push(`/${isTV ? 'tv' : 'movie'}/${f.id}`)} style={{ color: 'var(--text)', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
                      onMouseOver={e => (e.currentTarget.style.color = 'var(--gold)')}
                      onMouseOut={e => (e.currentTarget.style.color = 'var(--text)')}
                    >{f.title || f.name || '-'}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {f.character
                        ? <span style={{ display: 'inline-block', background: ko ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.04)', border: `1px solid ${ko ? 'rgba(201,168,76,.2)' : 'var(--border)'}`, color: ko ? 'var(--gold-light)' : 'var(--text-dim)', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontStyle: ko ? 'normal' : 'italic' }}>{f.character}</span>
                        : <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>-</span>
                      }
                      <span style={{ display: 'inline-block', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', border: '1px solid', whiteSpace: 'nowrap',
                        ...(f.order === undefined ? { color: 'var(--text-dim)', borderColor: 'var(--border)', background: 'rgba(255,255,255,.04)' } : f.order <= 2
                          ? { color: '#e8c97a', borderColor: 'rgba(232,201,122,.3)', background: 'rgba(232,201,122,.08)' }
                          : f.order <= 9
                          ? { color: '#7db8e8', borderColor: 'rgba(125,184,232,.3)', background: 'rgba(125,184,232,.08)' }
                          : { color: 'var(--text-dim)', borderColor: 'var(--border)', background: 'rgba(255,255,255,.04)' })
                      }}>
                        {f.order === undefined ? '특별출연' : f.order <= 2 ? '주연' : f.order <= 9 ? '조연' : '특별출연'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-block', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', border: '1px solid', color: isTV ? '#9b8de8' : '#7db8e8', borderColor: isTV ? 'rgba(155,141,232,.3)' : 'rgba(125,184,232,.3)', background: isTV ? 'rgba(155,141,232,.08)' : 'rgba(125,184,232,.08)', whiteSpace: 'nowrap' }}>{isTV ? '드라마' : '영화'}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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