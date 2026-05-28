'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Community() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ movie: '', actor: '', title: '', body: '' })

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function submitPost() {
    if (!form.movie || !form.actor || !form.title || !form.body) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    await supabase.from('posts').insert([{
      movie: form.movie,
      actor: form.actor,
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
                  <span className="post-tag tag-movie">{p.movie}</span>
                  <span className="post-tag tag-actor">{p.actor}</span>
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
            {movieTags.map(tag => (
              <li key={tag} onClick={() => setFilter(tag)}>{tag}</li>
            ))}
          </ul>
        </div>
        <div className="sidebar-block">
          <div className="sidebar-title">인기 배우 말머리</div>
          <ul className="sidebar-list">
            {actorTags.map(tag => (
              <li key={tag} onClick={() => setFilter(tag)}>{tag}</li>
            ))}
          </ul>
        </div>
      </aside>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', width: '540px', maxWidth: '95vw', padding: '28px' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>포스팅</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>작품과 배우 말머리를 달면 해당 페이지에 자동 연결됩니다.</div>
            {['movie', 'actor', 'title'].map(field => (
              <div key={field} style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  {field === 'movie' ? '작품명 (말머리 1)' : field === 'actor' ? '배우명 (말머리 2)' : '제목'}
                </label>
                <input
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'Noto Sans KR', fontSize: '13px', outline: 'none' }}
                  value={(form as any)[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={field === 'movie' ? '작품명 입력...' : field === 'actor' ? '배우명 입력...' : '제목을 입력하세요'}
                />
              </div>
            ))}
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