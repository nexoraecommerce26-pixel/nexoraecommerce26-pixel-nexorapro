'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const THEMES = {
  basic: [
    { id:'basic-clean', name:'Clean White', colors:{ bg:'#FFFFFF', primary:'#1B1F5E', accent:'#F5A623', text:'#374151' }, desc:'Simple, minimal, professional' },
    { id:'basic-soft', name:'Soft Lilac', colors:{ bg:'#F5F3FF', primary:'#6D28D9', accent:'#EC4899', text:'#374151' }, desc:'Soft purple tones, feminine' },
    { id:'basic-earth', name:'Earthy Green', colors:{ bg:'#F0FDF4', primary:'#166534', accent:'#F59E0B', text:'#374151' }, desc:'Natural, organic feel' },
  ],
  standard: [
    { id:'std-navy', name:'Navy Gold', colors:{ bg:'#F7F8FF', primary:'#1B1F5E', accent:'#F5A623', text:'#1F2937' }, desc:'Bold and trustworthy' },
    { id:'std-rose', name:'Rose Modern', colors:{ bg:'#FFF1F2', primary:'#BE123C', accent:'#F59E0B', text:'#1F2937' }, desc:'Trendy, fashion-forward' },
    { id:'std-dark', name:'Dark Minimal', colors:{ bg:'#111827', primary:'#F9FAFB', accent:'#F5A623', text:'#D1D5DB' }, desc:'Sleek dark mode shop' },
  ],
  premium: [
    { id:'pre-luxury', name:'Luxury Black', colors:{ bg:'#0A0A0A', primary:'#F5A623', accent:'#FFFFFF', text:'#E5E7EB' }, desc:'Premium luxury brand feel' },
    { id:'pre-royal', name:'Royal Blue', colors:{ bg:'#EFF6FF', primary:'#1D4ED8', accent:'#7C3AED', text:'#1E3A5F' }, desc:'Corporate, high-end' },
    { id:'pre-blush', name:'Blush Premium', colors:{ bg:'#FFF7F7', primary:'#9F1239', accent:'#F59E0B', text:'#1F2937' }, desc:'Elegant, bridal & fashion' },
  ],
}

export default function ThemePage() {
  const [shop, setShop] = useState<any>(null)
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const getSupabase = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  useEffect(() => {
    const load = async () => {
      const sb = await getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await sb.from('shops').select('*').eq('seller_id', user.id).single()
      setShop(data)
      setSelected(data?.theme_id || '')
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!selected) { setMsg('Please select a theme.'); return }
    setSaving(true); setMsg('')
    try {
      const sb = await getSupabase()
      const { error } = await sb.from('shops').update({ theme_id: selected }).eq('id', shop.id)
      if (error) throw error
      setMsg('✅ Theme saved! Your shop now uses this theme.')
    } catch(e:any){ setMsg(e.message) } finally { setSaving(false) }
  }

  const planThemes = shop ? THEMES[shop.plan as keyof typeof THEMES] || THEMES.basic : THEMES.basic
  const allThemes = shop?.plan === 'premium' ? [...THEMES.basic, ...THEMES.standard, ...THEMES.premium]
    : shop?.plan === 'standard' ? [...THEMES.basic, ...THEMES.standard]
    : THEMES.basic

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p>Loading...</p></div>

  return (
    <div style={{ minHeight:'100vh', background:'#F7F8FF', fontFamily:'Inter,sans-serif' }}>
      <nav style={{ background:'#1B1F5E', padding:'0 2rem', height:'60px', display:'flex', alignItems:'center', gap:'1rem' }}>
        <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', textDecoration:'none' }}>← Back to Dashboard</Link>
        <span style={{ color:'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ color:'#fff', fontWeight:700 }}>Choose Your Shop Theme</span>
      </nav>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1rem' }}>
        <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#1B1F5E', marginBottom:'.5rem' }}>Pick Your Shop Theme</h2>
        <p style={{ color:'#6B7280', fontSize:'14px', marginBottom:'2rem' }}>
          Your plan ({shop?.plan}) gives you access to {allThemes.length} themes. Premium sellers get all 9.
        </p>

        {(['basic','standard','premium'] as const).map(tier => {
          const tierThemes = THEMES[tier]
          const isLocked = (tier==='standard' && shop?.plan==='basic') || (tier==='premium' && shop?.plan!=='premium')
          return (
            <div key={tier} style={{ marginBottom:'2rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
                <h3 style={{ fontSize:'14px', fontWeight:700, color:'#1B1F5E', textTransform:'capitalize' }}>{tier} Themes</h3>
                {isLocked && <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', padding:'2px 8px', borderRadius:'100px', fontWeight:600 }}>🔒 Upgrade to unlock</span>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
                {tierThemes.map(theme => (
                  <div key={theme.id}
                    onClick={() => !isLocked && setSelected(theme.id)}
                    style={{
                      borderRadius:'16px', overflow:'hidden',
                      border: selected===theme.id ? '3px solid #1B1F5E' : '2px solid #E5E7F0',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.5 : 1,
                      transition:'all .2s',
                    }}>
                    {/* Theme preview */}
                    <div style={{ background:theme.colors.bg, padding:'1rem', height:'120px', position:'relative', borderBottom:'1px solid #E5E7F0' }}>
                      <div style={{ background:theme.colors.primary, height:'20px', borderRadius:'4px', marginBottom:'8px', width:'60%' }}/>
                      <div style={{ display:'flex', gap:'6px', marginBottom:'6px' }}>
                        {[1,2,3].map(i=>(
                          <div key={i} style={{ flex:1, background:theme.colors.bg==='#0A0A0A'?'#1F2937':theme.colors.bg==='#111827'?'#1F2937':'#F3F4F6', borderRadius:'6px', height:'50px', border:`1px solid ${theme.colors.primary}22` }}/>
                        ))}
                      </div>
                      <div style={{ position:'absolute', top:'10px', right:'10px', background:theme.colors.accent, width:'24px', height:'24px', borderRadius:'50%' }}/>
                      {selected===theme.id && <div style={{ position:'absolute', top:'8px', left:'8px', background:'#1B1F5E', color:'#fff', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'100px' }}>✓ Selected</div>}
                    </div>
                    <div style={{ padding:'.75rem 1rem', background:'#fff' }}>
                      <div style={{ fontWeight:700, color:'#1B1F5E', fontSize:'14px' }}>{theme.name}</div>
                      <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'2px' }}>{theme.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {msg && <p style={{ fontSize:'13px', color:msg.startsWith('✅')?'#10B981':'#DC2626', marginBottom:'1rem' }}>{msg}</p>}
        <button onClick={handleSave} disabled={saving} style={{ background:'#1B1F5E', color:'#fff', padding:'.85rem 2.5rem', borderRadius:'10px', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer' }}>
          {saving ? 'Saving...' : '✅ Save Theme'}
        </button>
      </div>
    </div>
  )
}