'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const IMG = 'https://image.tmdb.org/t/p/'

async function tmdb(path: string, params: Record<string, string> = {}) {
  const p = new URLSearchParams({ api_key: API_KEY!, language: 'ko-KR', ...params })
  const res = await fetch(`https://api.themoviedb.org/3${path}?${p}`)
  return res.json()
}

function TagSearchInput({ label, placeholder, value, onChange }: {
  label: string, placeholder: string, value: string, onChange: (v: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const timer = useRef<any>(null)

  function onInput(q: string) {
    setQuery(q)
    setSelected(false)
    onChange('')
    clearTimeout(timer.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      const data = await tmdb('/search/multi', { query: q, page: '1' })
      const results = data.results || []
      const movies = results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 4)
      const people = results.filter((r: any) => r.media_type === 'person').slice(0, 4)
      setResults([...movies, ...people])
      setOpen(true)
    }, 300)
  }

  function onSelect(name: string) {
    setQuery(name)
    setSelected(true)
    onChange(name)
    setOpen(false)
    setResults([])
  }

  function onClear() {
    setQuery('')
    setSelected(false)
    onChange('')
    setResults([])
    setOpen(false)
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            style={{ flex: 1, background: selected ? 'rgba(201,168,76,.08)' : 'var(--surface2)', border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '10px 14px', color: selected ? 'var(--gold)' : 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
            value={query}
            onChange={e => onInput(e.target.value)}
            placeholder={placeholder}
            onFocus={() => query && !selected && setOpen(true)}
          />
          {query && (
            <button onClick={onClear} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Noto Sans KR' }}>공란</button>
          )}
        </div>
        {selected && (
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--gold)' }}>✓ 선택됨</div>
        )}
        {open && results.length > 0 && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', zIndex: 100, maxHeight: '240px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
            {results.map(r => {
              const name = r.title || r.name || ''
              const type = r.media_type === 'tv' ? '드라마' : r.media_type === 'movie' ? '영화' : '배우'
              const img = r.poster_path || r.profile_path
              return (
                <div key={r.id} onClick={() => onSelect(name)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {img
                    ? <img src={`${IMG}w92${img}`} style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} alt="" />
                    : <div style={{ width: '32px', height: '44px', background: 'var(--surface2)', borderRadius: '3px', flexShrink: 0 }} />
                  }
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{type}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Community() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ movie: '', actor: '', title: '', body: '' })

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function submitPost() {
    if (!form.title || !form.body) { alert('제목과 내용을 입력해주세요.'); return }
    await supabase.from('posts').insert([{
      movie: form.movie || '(작품 없음)',
      actor: form.actor || '(배우 없음)',
      title: form.title,
      body: form.body,
      nickname: '익명'
    }])
    setForm({ movie: '', actor: '', title: '', body: '' })
    setShowModal(false)
    loadPosts()
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.movie === filter || p.actor === filter)
  const movieTags = [...new Set(posts.map(p => p.movie))].slice(0, 6)
  const actorTags = [...new Set(posts.map(p => p.actor))].slice(0, 6)

  return (
    <div className="layout">
      <main>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>전체</div>
            {filter !== 'all' && (
              <div className="filter-chip active">{filter} <span onClick={() => setFilter('all')} style={{ marginLeft: '4px', cursor: 'pointer' }}>×</span></div>
            )}
          </div>
          <button className="write-btn" onClick={() => setShowModal(true)}>✏ 포스팅</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="post-empty">포스팅이 없어요. 첫 번째로 작성해보세요!</div>
        ) : (
          <div className="post-feed">
            {filtered.map(p => (
              <div key={p.id} className="post-card">
                <div className="post-card-tags">
                  {p.movie && p.movie !== '(작품 없음)' && <span className="post-tag tag-movie">{p.movie}</span>}
                  {p.actor && p.actor !== '(배우 없음)' && <span className="post-tag tag-actor">{p.actor}</span>}
                </div>
                <div className="post-card-title">{p.title}</div>
                <div className="post-card-body">{p.body}</div>
                <div className="post-card-meta">
                  <span>👁 {p.views || 0}</span>
                  <span>♥ {p.likes || 0}</span>
                  <span>{new Date(p.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <aside>
        <div className="sidebar-block">
          <div className="sidebar-title">인기 작품 말머리</div>
          <ul className="sidebar-list">
            {movieTags.filter(t => t !== '(작품 없음)').map(tag => (
              <li key={tag} onClick={() => setFilter(tag)}>{tag}</li>
            ))}
          </ul>
        </div>
        <div className="sidebar-block">
          <div className="sidebar-title">인기 배우 말머리</div>
          <ul className="sidebar-list">
            {actorTags.filter(t => t !== '(배우 없음)').map(tag => (
              <li key={tag} onClick={() => setFilter(tag)}>{tag}</li>
            ))}
          </ul>
        </div>
      </aside>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', width: '540px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>포스팅</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>말머리는 검색해서 선택하거나 공란으로 둘 수 있어요.</div>

            <TagSearchInput
              label="작품명 (말머리 1)"
              placeholder="작품 검색..."
              value={form.movie}
              onChange={v => setForm(f => ({ ...f, movie: v }))}
            />
            <TagSearchInput
              label="배우명 (말머리 2)"
              placeholder="배우 검색..."
              value={form.actor}
              onChange={v => setForm(f => ({ ...f, actor: v }))}
            />

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>제목</label>
              <input
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>내용</label>
              <textarea
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none', minHeight: '120px', resize: 'vertical' }}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="자유롭게 작성하세요..."
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '9px 20px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'Noto Sans KR', fontSize: '13px' }}>취소</button>
              <button onClick={submitPost} style={{ background: 'var(--gold)', border: 'none', color: 'var(--bg)', padding: '9px 24px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'Noto Sans KR', fontSize: '13px', fontWeight: 700 }}>게시하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}