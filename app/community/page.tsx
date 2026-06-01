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

// 작품 검색 인풋
function MovieSearchInput({ selectedMovies, onAdd, onRemove }: {
  selectedMovies: string[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<any>(null)

  function onInput(q: string) {
    setQuery(q)
    clearTimeout(timer.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      const data = await tmdb('/search/multi', { query: q, page: '1' })
      const results = (data.results || []).filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 6)
      setResults(results)
      setOpen(true)
    }, 300)
  }

  function onSelect(name: string) {
    if (selectedMovies.includes(name)) return
    if (selectedMovies.length >= 3) return
    onAdd(name)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>작품 말머리 (최대 3개)</label>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {selectedMovies.map(m => (
          <div key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(125,184,232,.12)', border: '1px solid rgba(125,184,232,.2)', color: '#7db8e8', fontSize: '12px', padding: '3px 10px', borderRadius: '20px' }}>
            {m}
            <span onClick={() => onRemove(m)} style={{ cursor: 'pointer', opacity: .7, fontSize: '14px' }}>×</span>
          </div>
        ))}
      </div>
      {selectedMovies.length < 3 && (
        <div style={{ position: 'relative' }}>
          <input
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
            value={query}
            onChange={e => onInput(e.target.value)}
            placeholder="작품 검색..."
          />
          {open && results.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', zIndex: 100, maxHeight: '240px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
              {results.map(r => {
                const name = r.title || r.name || ''
                const type = r.media_type === 'tv' ? '드라마' : '영화'
                const img = r.poster_path
                const already = selectedMovies.includes(name)
                return (
                  <div key={r.id} onClick={() => !already && onSelect(name)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: already ? 'default' : 'pointer', borderBottom: '1px solid var(--border)', opacity: already ? .4 : 1 }}
                    onMouseOver={e => { if (!already) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {img ? <img src={`${IMG}w92${img}`} style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} alt="" />
                      : <div style={{ width: '32px', height: '44px', background: 'var(--surface2)', borderRadius: '3px', flexShrink: 0 }} />}
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
      )}
    </div>
  )
}

// 배우 검색 인풋
function ActorSearchInput({ selectedMovies, selectedActors, onAdd, onRemove }: {
  selectedMovies: string[]
  selectedActors: string[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<any>(null)

  function onInput(q: string) {
    setQuery(q)
    clearTimeout(timer.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      const data = await tmdb('/search/multi', { query: q, page: '1' })
      const results = (data.results || []).filter((r: any) => r.media_type === 'person').slice(0, 6)
      setResults(results)
      setOpen(true)
    }, 300)
  }

  function onSelect(name: string) {
    if (selectedActors.includes(name)) return
    if (selectedActors.length >= 3) return
    onAdd(name)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>배우 말머리 (최대 3개)</label>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {selectedActors.map(a => (
          <div key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.2)', color: 'var(--gold-light)', fontSize: '12px', padding: '3px 10px', borderRadius: '20px' }}>
            {a}
            <span onClick={() => onRemove(a)} style={{ cursor: 'pointer', opacity: .7, fontSize: '14px' }}>×</span>
          </div>
        ))}
      </div>
      {selectedActors.length < 3 && (
        <div style={{ position: 'relative' }}>
          <input
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
            value={query}
            onChange={e => onInput(e.target.value)}
            placeholder="배우 검색..."
          />
          {open && results.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', zIndex: 100, maxHeight: '240px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
              {results.map(p => {
                const already = selectedActors.includes(p.name)
                return (
                  <div key={p.id} onClick={() => !already && onSelect(p.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: already ? 'default' : 'pointer', borderBottom: '1px solid var(--border)', opacity: already ? .4 : 1 }}
                    onMouseOver={e => { if (!already) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {p.profile_path ? <img src={`${IMG}w92${p.profile_path}`} style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} alt="" />
                      : <div style={{ width: '32px', height: '44px', background: 'var(--surface2)', borderRadius: '3px', flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>배우</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 포스트 카드
function PostCard({ post, onLike, onClick }: { post: any, onLike: (id: number) => void, onClick: (post: any) => void }) {
  const movies: string[] = post.movies || []
  const actors: string[] = post.actors || []
  return (
    <div className="post-card" onClick={() => onClick(post)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="post-card-tags">
          {movies.map(m => <span key={m} className="post-tag tag-movie">{m}</span>)}
          {actors.map(a => <span key={a} className="post-tag tag-actor">{a}</span>)}
        </div>
      </div>
      <div className="post-card-title">{post.title}</div>
      <div className="post-card-body">{(post.body || '').replace(/\n/g, ' ')}</div>
      <div className="post-card-meta">
        <span style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onLike(post.id) }}>♡ {post.likes || 0}</span>
        <span>💬 {post.comment_count || 0}</span>
        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
        {post.edited_at && <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>수정됨</span>}
      </div>
    </div>
  )
}

// 포스트 상세
function PostDetail({ post, onBack, onLike }: { post: any, onBack: () => void, onLike: (id: number) => void }) {
  const [comments, setComments] = useState<any[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [commentNick, setCommentNick] = useState('')
  const [commentPw, setCommentPw] = useState('')
  const movies: string[] = post.movies || []
  const actors: string[] = post.actors || []

  useEffect(() => { loadComments() }, [post.id])

  async function loadComments() {
    const { data } = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function submitComment() {
    if (!commentBody.trim()) return
    await supabase.from('comments').insert([{
      post_id: post.id,
      nickname: commentNick || '익명',
      body: commentBody,
      password: commentPw || null
    }])
    setCommentBody('')
    setCommentNick('')
    setCommentPw('')
    loadComments()
  }

  async function likeComment(id: number, current: number) {
    await supabase.from('comments').update({ likes: current + 1 }).eq('id', id)
    loadComments()
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← 커뮤니티로</button>
      <div className="post-detail">
        <div className="post-detail-tags">
          {movies.map(m => <span key={m} className="post-tag tag-movie">{m}</span>)}
          {actors.map(a => <span key={a} className="post-tag tag-actor">{a}</span>)}
        </div>
        <div className="post-detail-title">{post.title}</div>
        <div className="post-detail-meta">
          <span>{post.nickname}</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onLike(post.id)}>♡ {post.likes || 0}</span>
          {post.edited_at && <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>수정됨</span>}
        </div>
        <div className="post-detail-body">
          {(post.body || '').split('\n').map((l: string, i: number) => <p key={i}>{l || '\u00A0'}</p>)}
        </div>
      </div>

      <div className="comment-section">
        <div className="comment-head">댓글 {comments.length}개</div>
        {comments.length === 0 && <div style={{ padding: '12px 0', color: 'var(--text-dim)', fontSize: '13px' }}>첫 댓글을 달아보세요!</div>}
        {comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-author">{c.nickname || '익명'}<span>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span></div>
            <div className="comment-body">{c.body}</div>
            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-dim)', cursor: 'pointer' }} onClick={() => likeComment(c.id, c.likes || 0)}>♡ {c.likes || 0}</div>
          </div>
        ))}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }} value={commentNick} onChange={e => setCommentNick(e.target.value)} placeholder="닉네임 (선택)" />
            <input style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }} value={commentPw} onChange={e => setCommentPw(e.target.value)} placeholder="비번 (선택)" type="password" />
          </div>
          <div className="comment-input-row">
            <input value={commentBody} onChange={e => setCommentBody(e.target.value)} placeholder="댓글을 입력하세요..." onKeyDown={e => e.key === 'Enter' && submitComment()} />
            <button onClick={submitComment}>등록</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Community() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'hot'>('all')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [form, setForm] = useState({ movies: [] as string[], actors: [] as string[], title: '', body: '', nickname: '', password: '' })

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function likePost(id: number) {
    const post = posts.find(p => p.id === id)
    if (!post) return
    await supabase.from('posts').update({ likes: (post.likes || 0) + 1 }).eq('id', id)
    setPosts(posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p))
  }

  async function submitPost() {
    if (!form.title || !form.body) { alert('제목과 내용을 입력해주세요.'); return }
    if (!form.password) { alert('비번을 입력해주세요. 수정/삭제에 필요해요.'); return }
    await supabase.from('posts').insert([{
      movies: form.movies,
      actors: form.actors,
      title: form.title,
      body: form.body,
      nickname: form.nickname || '익명',
      password: form.password,
    }])
    setForm({ movies: [], actors: [], title: '', body: '', nickname: '', password: '' })
    setShowModal(false)
    loadPosts()
  }

  const displayPosts = posts.filter(p => {
    if (filter !== 'all') {
      const movies: string[] = p.movies || []
      const actors: string[] = p.actors || []
      if (!movies.includes(filter) && !actors.includes(filter)) return false
    }
    return true
  })

  const hotPosts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).filter(p => (p.likes || 0) > 0)
  const finalPosts = tab === 'hot' ? hotPosts : displayPosts

  const allTags = posts.flatMap(p => [...(p.movies || []), ...(p.actors || [])])
  const tagCount: Record<string, number> = {}
  allTags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1 })
  const topMovieTags = [...new Set(posts.flatMap(p => p.movies || []))].slice(0, 6)
  const topActorTags = [...new Set(posts.flatMap(p => p.actors || []))].slice(0, 6)

  if (selectedPost) {
    return (
      <div className="layout">
        <main>
          <PostDetail
            post={selectedPost}
            onBack={() => { setSelectedPost(null); loadPosts() }}
            onLike={likePost}
          />
        </main>
        <aside>
          <div className="sidebar-block">
            <div className="sidebar-title">관련 바로가기</div>
            <ul className="sidebar-list">
              {(selectedPost.movies || []).map((m: string) => (
                <li key={m} onClick={() => { setFilter(m); setSelectedPost(null) }}>{m} 포스팅<span className="cnt">→</span></li>
              ))}
              {(selectedPost.actors || []).map((a: string) => (
                <li key={a} onClick={() => { setFilter(a); setSelectedPost(null) }}>{a} 포스팅<span className="cnt">→</span></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className="layout">
      <main>
        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <button onClick={() => setTab('all')} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === 'all' ? 'var(--gold)' : 'transparent'}`, color: tab === 'all' ? 'var(--gold)' : 'var(--text-muted)', fontFamily: 'Noto Sans KR', fontSize: '13px', fontWeight: 500, padding: '10px 18px', cursor: 'pointer', marginBottom: '-1px' }}>전체</button>
          <button onClick={() => setTab('hot')} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === 'hot' ? 'var(--gold)' : 'transparent'}`, color: tab === 'hot' ? 'var(--gold)' : 'var(--text-muted)', fontFamily: 'Noto Sans KR', fontSize: '13px', fontWeight: 500, padding: '10px 18px', cursor: 'pointer', marginBottom: '-1px' }}>🔥 인기</button>
          <div style={{ marginLeft: 'auto' }}>
            <button className="write-btn" onClick={() => setShowModal(true)}>✏ 포스팅</button>
          </div>
        </div>

        {/* 필터 */}
        {filter !== 'all' && (
          <div style={{ marginBottom: '12px' }}>
            <div className="filter-chip active">{filter} <span onClick={() => setFilter('all')} style={{ marginLeft: '4px', cursor: 'pointer' }}>×</span></div>
          </div>
        )}

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : finalPosts.length === 0 ? (
          <div className="post-empty">{tab === 'hot' ? '아직 인기 포스팅이 없어요.' : '포스팅이 없어요. 첫 번째로 작성해보세요!'}</div>
        ) : (
          <div className="post-feed">
            {finalPosts.map(p => (
              <PostCard key={p.id} post={p} onLike={likePost} onClick={setSelectedPost} />
            ))}
          </div>
        )}
      </main>

      <aside>
        <div className="sidebar-block">
          <div className="sidebar-title">인기 작품 말머리</div>
          <ul className="sidebar-list">
            {topMovieTags.map(tag => (
              <li key={tag} onClick={() => { setFilter(tag); setTab('all') }}>{tag}<span className="cnt">{tagCount[tag]}</span></li>
            ))}
          </ul>
        </div>
        <div className="sidebar-block">
          <div className="sidebar-title">인기 배우 말머리</div>
          <ul className="sidebar-list">
            {topActorTags.map(tag => (
              <li key={tag} onClick={() => { setFilter(tag); setTab('all') }}>{tag}<span className="cnt">{tagCount[tag]}</span></li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 포스팅 모달 */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', width: '540px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>포스팅</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>말머리는 작품/배우 각각 최대 3개까지 선택할 수 있어요.</div>

            <MovieSearchInput
              selectedMovies={form.movies}
              onAdd={name => setForm(f => ({ ...f, movies: [...f.movies, name] }))}
              onRemove={name => setForm(f => ({ ...f, movies: f.movies.filter(m => m !== name) }))}
            />
            <ActorSearchInput
              selectedMovies={form.movies}
              selectedActors={form.actors}
              onAdd={name => setForm(f => ({ ...f, actors: [...f.actors, name] }))}
              onRemove={name => setForm(f => ({ ...f, actors: f.actors.filter(a => a !== name) }))}
            />

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>제목</label>
              <input style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="제목을 입력하세요" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>내용</label>
              <textarea style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none', minHeight: '120px', resize: 'vertical', lineHeight: 1.7 }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="자유롭게 작성하세요..." />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>닉네임 (선택)</label>
                <input style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }} value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} placeholder="익명" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>비번 (수정/삭제용)</label>
                <input style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="비번 입력" type="password" />
              </div>
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