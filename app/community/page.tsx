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

// ── localStorage 하트 헬퍼 ──────────────────────────────────────
function hasLiked(type: 'post' | 'comment', id: number): boolean {
  if (typeof window === 'undefined') return false
  const key = `liked_${type}_${id}`
  return localStorage.getItem(key) === '1'
}
function setLiked(type: 'post' | 'comment', id: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`liked_${type}_${id}`, '1')
}

// ── 작품 검색 인풋 ─────────────────────────────────────────────
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

// ── 배우 검색 인풋 ─────────────────────────────────────────────
function ActorSearchInput({ selectedActors, onAdd, onRemove }: {
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

// ── 포스트 카드 ────────────────────────────────────────────────
function PostCard({ post, onLike, onClick }: { post: any, onLike: (id: number) => void, onClick: (post: any) => void }) {
  const movies: string[] = post.movies || []
  const actors: string[] = post.actors || []
  const liked = hasLiked('post', post.id)

  return (
    <div className="post-card" onClick={() => onClick(post)}>
      <div className="post-card-tags">
        {movies.map(m => <span key={m} className="post-tag tag-movie">{m}</span>)}
        {actors.map(a => <span key={a} className="post-tag tag-actor">{a}</span>)}
      </div>
      {/* 제목 없이 본문만 */}
      <div className="post-card-body" style={{ marginTop: movies.length + actors.length > 0 ? '10px' : '0' }}>
        {(post.body || '').replace(/\n/g, ' ')}
      </div>
      <div className="post-card-meta">
        <span
          style={{ cursor: liked ? 'default' : 'pointer', color: liked ? 'var(--gold)' : undefined }}
          onClick={e => { e.stopPropagation(); onLike(post.id) }}
        >
          {liked ? '♥' : '♡'} {post.likes || 0}
        </span>
        <span>💬 {post.comment_count || 0}</span>
        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
        {post.edited_at && <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>수정됨</span>}
      </div>
    </div>
  )
}

// ── 댓글 아이템 (대댓글 포함) ───────────────────────────────────
function CommentItem({ comment, allComments, onLike, onReply }: {
  comment: any
  allComments: any[]
  onLike: (id: number, current: number) => void
  onReply: (parentId: number, parentNick: string) => void
}) {
  const replies = allComments.filter(c => c.parent_id === comment.id)
  const liked = hasLiked('comment', comment.id)

  return (
    <div>
      {/* 원댓글 */}
      <div className="comment-item">
        <div className="comment-author">
          {comment.nickname || '익명'}
          <span>{new Date(comment.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
        <div className="comment-body">{comment.body}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
          <span
            style={{ cursor: liked ? 'default' : 'pointer', color: liked ? 'var(--gold)' : undefined }}
            onClick={() => onLike(comment.id, comment.likes || 0)}
          >
            {liked ? '♥' : '♡'} {comment.likes || 0}
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onReply(comment.id, comment.nickname || '익명')}
          >
            답글
          </span>
        </div>
      </div>

      {/* 대댓글 */}
      {replies.map(r => {
        const rLiked = hasLiked('comment', r.id)
        return (
          <div key={r.id} className="comment-item" style={{
            marginLeft: '24px',
            paddingLeft: '14px',
            borderLeft: '2px solid var(--border)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div className="comment-author" style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--text-dim)', marginRight: '4px' }}>↳</span>
              {r.nickname || '익명'}
              <span>{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="comment-body">{r.body}</div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
              <span
                style={{ cursor: rLiked ? 'default' : 'pointer', color: rLiked ? 'var(--gold)' : undefined }}
                onClick={() => onLike(r.id, r.likes || 0)}
              >
                {rLiked ? '♥' : '♡'} {r.likes || 0}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── 포스트 상세 ────────────────────────────────────────────────
function PostDetail({ post, onBack, onLike }: { post: any, onBack: () => void, onLike: (id: number) => void }) {
  const [comments, setComments] = useState<any[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [commentNick, setCommentNick] = useState('')
  const [commentPw, setCommentPw] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number, nick: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const movies: string[] = post.movies || []
  const actors: string[] = post.actors || []
  const postLiked = hasLiked('post', post.id)

  useEffect(() => { loadComments() }, [post.id])

  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (error) console.error('댓글 로드 오류:', error)
    setComments(data || [])
  }

  async function submitComment() {
    if (!commentBody.trim()) return
    const { error } = await supabase.from('comments').insert([{
      post_id: post.id,
      nickname: commentNick || '익명',
      body: commentBody,
      password: commentPw || null,
      parent_id: replyTo ? replyTo.id : null,
    }])
    if (error) { console.error('댓글 등록 오류:', error); return }
    setCommentBody('')
    setCommentNick('')
    setCommentPw('')
    setReplyTo(null)
    loadComments()
  }

  async function likeComment(id: number, current: number) {
    if (hasLiked('comment', id)) return
    setLiked('comment', id)
    await supabase.from('comments').update({ likes: current + 1 }).eq('id', id)
    setComments(prev => prev.map(c => c.id === id ? { ...c, likes: current + 1 } : c))
  }

  function sharePost() {
    const url = `${window.location.origin}/community?post=${post.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // 최상위 댓글만 필터 (parent_id가 null인 것)
  const topLevelComments = comments.filter(c => !c.parent_id)

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← 커뮤니티로</button>
      <div className="post-detail">
        <div className="post-detail-tags">
          {movies.map(m => <span key={m} className="post-tag tag-movie">{m}</span>)}
          {actors.map(a => <span key={a} className="post-tag tag-actor">{a}</span>)}
        </div>

        {/* 제목 없이 본문만 */}
        <div className="post-detail-body" style={{ marginTop: movies.length + actors.length > 0 ? '14px' : '0' }}>
          {(post.body || '').split('\n').map((l: string, i: number) => <p key={i}>{l || '\u00A0'}</p>)}
        </div>

        <div className="post-detail-meta" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{post.nickname}</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          <span
            style={{ cursor: postLiked ? 'default' : 'pointer', color: postLiked ? 'var(--gold)' : undefined }}
            onClick={() => onLike(post.id)}
          >
            {postLiked ? '♥' : '♡'} {post.likes || 0}
          </span>
          {post.edited_at && <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>수정됨</span>}
          {/* URL 공유 버튼 */}
          <span
            onClick={sharePost}
            style={{ cursor: 'pointer', fontSize: '12px', color: copied ? 'var(--gold)' : 'var(--text-muted)', marginLeft: 'auto', userSelect: 'none' }}
          >
            {copied ? '✓ 링크 복사됨' : '🔗 공유'}
          </span>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="comment-section">
        <div className="comment-head">댓글 {comments.length}개</div>

        {comments.length === 0 && (
          <div style={{ padding: '12px 0', color: 'var(--text-dim)', fontSize: '13px' }}>첫 댓글을 달아보세요!</div>
        )}

        {topLevelComments.map(c => (
          <CommentItem
            key={c.id}
            comment={c}
            allComments={comments}
            onLike={likeComment}
            onReply={(id, nick) => setReplyTo({ id, nick })}
          />
        ))}

        {/* 댓글 입력 */}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {/* 답글 대상 표시 */}
          {replyTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface2)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>
              <span>↳ <strong style={{ color: 'var(--text)' }}>{replyTo.nick}</strong>님에게 답글</span>
              <span onClick={() => setReplyTo(null)} style={{ cursor: 'pointer', marginLeft: 'auto', fontSize: '14px' }}>×</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
              value={commentNick}
              onChange={e => setCommentNick(e.target.value)}
              placeholder="닉네임 (선택)"
            />
            <input
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
              value={commentPw}
              onChange={e => setCommentPw(e.target.value)}
              placeholder="비번 (선택)"
              type="password"
            />
          </div>
          <div className="comment-input-row">
            <input
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
              placeholder={replyTo ? `${replyTo.nick}님에게 답글...` : '댓글을 입력하세요...'}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
            />
            <button onClick={submitComment}>등록</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 메인 Community 컴포넌트 ───────────────────────────────────
export default function Community() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'hot'>('all')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [form, setForm] = useState({
    movies: [] as string[],
    actors: [] as string[],
    body: '',
    nickname: '',
    password: ''
  })

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('포스트 로드 오류:', error)
    setPosts(data || [])
    setLoading(false)
  }

  async function likePost(id: number) {
    if (hasLiked('post', id)) return
    setLiked('post', id)
    const post = posts.find(p => p.id === id)
    if (!post) return
    const newLikes = (post.likes || 0) + 1
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: newLikes } : p))
    // 상세 보기 중이면 selectedPost도 업데이트
    if (selectedPost?.id === id) {
      setSelectedPost((prev: any) => ({ ...prev, likes: newLikes }))
    }
  }

  async function submitPost() {
    if (!form.body.trim()) { alert('내용을 입력해주세요.'); return }
    if (!form.password) { alert('비번을 입력해주세요. 수정/삭제에 필요해요.'); return }
    const { error } = await supabase.from('posts').insert([{
      movies: form.movies,
      actors: form.actors,
      title: '',          // DB 컬럼 호환 유지 (빈 문자열)
      body: form.body,
      nickname: form.nickname || '익명',
      password: form.password,
    }])
    if (error) { console.error('포스트 등록 오류:', error); return }
    setForm({ movies: [], actors: [], body: '', nickname: '', password: '' })
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

  const hotPosts = [...posts]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .filter(p => (p.likes || 0) > 0)

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
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', width: '540px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>포스팅</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>말머리는 작품/배우 각각 최대 3개까지 선택할 수 있어요.</div>

            <MovieSearchInput
              selectedMovies={form.movies}
              onAdd={name => setForm(f => ({ ...f, movies: [...f.movies, name] }))}
              onRemove={name => setForm(f => ({ ...f, movies: f.movies.filter(m => m !== name) }))}
            />
            <ActorSearchInput
              selectedActors={form.actors}
              onAdd={name => setForm(f => ({ ...f, actors: [...f.actors, name] }))}
              onRemove={name => setForm(f => ({ ...f, actors: f.actors.filter(a => a !== name) }))}
            />

            {/* 제목 필드 제거 — 본문만 */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>내용</label>
              <textarea
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none', minHeight: '140px', resize: 'vertical', lineHeight: 1.7 }}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="자유롭게 작성하세요..."
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>닉네임 (선택)</label>
                <input
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
                  value={form.nickname}
                  onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                  placeholder="익명"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>비번 (수정/삭제용)</label>
                <input
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="비번 입력"
                  type="password"
                />
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
