'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const THEME_STYLES: Record<string, any> = {
  'basic-clean': { bg:'#FFFFFF', primary:'#1B1F5E', accent:'#F5A623', text:'#374151', cardBg:'#F9FAFB', navBg:'#1B1F5E', navText:'#fff' },
  'basic-soft':  { bg:'#F5F3FF', primary:'#6D28D9', accent:'#EC4899', text:'#374151', cardBg:'#EDE9FE', navBg:'#6D28D9', navText:'#fff' },
  'basic-earth': { bg:'#F0FDF4', primary:'#166534', accent:'#F59E0B', text:'#374151', cardBg:'#DCFCE7', navBg:'#166534', navText:'#fff' },
  'std-navy':    { bg:'#F7F8FF', primary:'#1B1F5E', accent:'#F5A623', text:'#1F2937', cardBg:'#FFFFFF', navBg:'#1B1F5E', navText:'#fff' },
  'std-rose':    { bg:'#FFF1F2', primary:'#BE123C', accent:'#F59E0B', text:'#1F2937', cardBg:'#FFFFFF', navBg:'#BE123C', navText:'#fff' },
  'std-dark':    { bg:'#111827', primary:'#F9FAFB', accent:'#F5A623', text:'#D1D5DB', cardBg:'#1F2937', navBg:'#030712', navText:'#F9FAFB' },
  'pre-luxury':  { bg:'#0A0A0A', primary:'#F5A623', accent:'#FFFFFF', text:'#E5E7EB', cardBg:'#1A1A1A', navBg:'#000000', navText:'#F5A623' },
  'pre-royal':   { bg:'#EFF6FF', primary:'#1D4ED8', accent:'#7C3AED', text:'#1E3A5F', cardBg:'#FFFFFF', navBg:'#1D4ED8', navText:'#fff' },
  'pre-blush':   { bg:'#FFF7F7', primary:'#9F1239', accent:'#F59E0B', text:'#1F2937', cardBg:'#FFFFFF', navBg:'#9F1239', navText:'#fff' },
}

const DEFAULT_THEME = THEME_STYLES['std-navy']

export default function ShopPage({ params }: { params: { id: string } }) {
  const [shop, setShop] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [orderForm, setOrderForm] = useState({ name:'', phone:'', address:'', delivery:'inside', payment:'cod' })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placing, setPlacing] = useState(false)

  const theme = shop?.theme_id ? (THEME_STYLES[shop.theme_id] || DEFAULT_THEME) : DEFAULT_THEME
  const isPremium = shop?.plan==='premium'
  const isStandard = shop?.plan==='standard' || isPremium

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: shopData } = await sb.from('shops').select('*').eq('id', params.id).single()
      const { data: productsData } = await sb.from('products').select('*').eq('shop_id', params.id).eq('is_available', true)
      const { data: offersData } = await sb.from('offers').select('*').eq('shop_id', params.id)
      setShop(shopData); setProducts(productsData||[]); setOffers(offersData||[])
      setLoading(false)
    }
    load()
  }, [params.id])

  const addToCart = (product: any) => {
    setCart(c => {
      const ex = c.find(i => i.id===product.id)
      if (ex) return c.map(i => i.id===product.id ? {...i, qty:i.qty+1} : i)
      return [...c, {...product, qty:1}]
    })
  }

  const removeFromCart = (id: string) => setCart(c => c.filter(i => i.id!==id))

  const deliveryCharge = orderForm.delivery==='inside' ? (shop?.delivery_inside_city||0) : (shop?.delivery_outside_city||0)
  const subtotal = cart.reduce((s,i) => s+(i.selling_price||i.price)*i.qty, 0)
  const total = subtotal + deliveryCharge

  const placeOrder = async () => {
    if (!orderForm.name||!orderForm.phone||!orderForm.address) return
    setPlacing(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const costTotal = cart.reduce((s,i) => s+(i.cost_price||0)*i.qty, 0)
      const { data: order, error } = await sb.from('orders').insert({
        shop_id: shop.id,
        customer_name: orderForm.name,
        customer_phone: orderForm.phone,
        customer_address: orderForm.address,
        total_amount: total,
        delivery_charge: deliveryCharge,
        cost_total: costTotal,
        payment_method: orderForm.payment,
        payment_status: orderForm.payment==='cod'?'unpaid':'unpaid',
      }).select().single()
      if (error) throw error
      // Insert order items
      await sb.from('order_items').insert(cart.map(i => ({ order_id:order.id, product_id:i.id, quantity:i.qty, unit_price:i.selling_price||i.price })))
      setOrderPlaced(true)
      setCart([])
    } catch(e){ console.error(e) } finally { setPlacing(false) }
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p>Loading shop...</p></div>
  if (!shop) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p>Shop not found.</p></div>

  if (orderPlaced) return (
    <div style={{ minHeight:'100vh', background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ background:theme.cardBg, borderRadius:'20px', padding:'3rem', textAlign:'center', maxWidth:'400px', boxShadow:'0 8px 32px rgba(0,0,0,.1)' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎉</div>
        <h2 style={{ color:theme.primary, fontWeight:800, marginBottom:'.5rem' }}>Order Placed!</h2>
        <p style={{ color:theme.text, fontSize:'14px', marginBottom:'2rem', lineHeight:1.6 }}>Your order has been sent to {shop.shop_name}. They'll contact you at {orderForm.phone} to confirm.</p>
        <button onClick={()=>{setOrderPlaced(false);setCheckout(false)}} style={{ background:theme.primary, color:theme.navText, padding:'.75rem 2rem', borderRadius:'10px', fontWeight:700, border:'none', cursor:'pointer' }}>Continue Shopping</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:'Inter,sans-serif', color:theme.text }}>
      {/* Shop Nav */}
      <nav style={{ background:theme.navBg, padding:'0 5vw', height:isPremium?'72px':'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <div style={{ color:theme.navText, fontWeight:800, fontSize:isPremium?'1.4rem':'1.2rem' }}>{shop.shop_name}</div>
          {isPremium && <div style={{ color:`${theme.navText}99`, fontSize:'12px' }}>{shop.category}</div>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Link href="/" style={{ color:`${theme.navText}80`, fontSize:'13px', textDecoration:'none' }}>← Nexora</Link>
          <button onClick={()=>setShowCart(!showCart)} style={{ background:theme.accent, color:'#1B1F5E', border:'none', padding:'.5rem 1.1rem', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
            🛒 Cart {cart.length>0 && `(${cart.reduce((s,i)=>s+i.qty,0)})`}
          </button>
        </div>
      </nav>

      {/* Premium hero */}
      {isPremium && (
        <div style={{ background:theme.primary, padding:'3rem 5vw', textAlign:'center' }}>
          <h1 style={{ color:theme.navText, fontSize:'2.2rem', fontWeight:800, marginBottom:'.5rem' }}>{shop.shop_name}</h1>
          {shop.description && <p style={{ color:`${theme.navText}80`, fontSize:'1rem', maxWidth:'500px', margin:'0 auto' }}>{shop.description}</p>}
          <div style={{ display:'flex', justifyContent:'center', gap:'2rem', marginTop:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ color:theme.accent, textAlign:'center' }}><div style={{ fontWeight:800, fontSize:'1.3rem' }}>{products.length}</div><div style={{ fontSize:'12px', opacity:.7 }}>Products</div></div>
            {shop.delivery_inside_city>0 && <div style={{ color:theme.accent, textAlign:'center' }}><div style={{ fontWeight:800, fontSize:'1.3rem' }}>৳{shop.delivery_inside_city}</div><div style={{ fontSize:'12px', opacity:.7 }}>City Delivery</div></div>}
          </div>
        </div>
      )}

      {/* Standard header */}
      {isStandard && !isPremium && (
        <div style={{ background:theme.cardBg, padding:'1.5rem 5vw', borderBottom:`1px solid ${theme.primary}22` }}>
          <h1 style={{ color:theme.primary, fontWeight:800, fontSize:'1.5rem', marginBottom:'4px' }}>{shop.shop_name}</h1>
          {shop.description && <p style={{ color:theme.text, fontSize:'13px', opacity:.7 }}>{shop.description}</p>}
        </div>
      )}

      {/* Offers */}
      {offers.length>0 && (
        <div style={{ padding:'1.25rem 5vw', background:theme.cardBg, borderBottom:`1px solid ${theme.primary}11` }}>
          <div style={{ display:'flex', gap:'.75rem', overflowX:'auto' }}>
            {offers.map(o=>(
              <div key={o.id} style={{ background:`${theme.accent}22`, border:`1px solid ${theme.accent}44`, borderRadius:'10px', padding:'.6rem 1rem', minWidth:'180px', flexShrink:0 }}>
                <div style={{ fontWeight:700, fontSize:'13px', color:theme.primary }}>{o.title}</div>
                {o.discount_percent>0 && <span style={{ background:theme.accent, color:'#1B1F5E', fontWeight:800, padding:'2px 8px', borderRadius:'100px', fontSize:'12px', marginTop:'4px', display:'inline-block' }}>{o.discount_percent}% OFF</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery info */}
      {(shop.delivery_inside_city>0 || shop.delivery_outside_city>0) && (
        <div style={{ background:`${theme.accent}15`, padding:'.75rem 5vw', display:'flex', gap:'2rem', fontSize:'13px', color:theme.text, flexWrap:'wrap' }}>
          {shop.delivery_inside_city>0 && <span>🏙️ Inside City: <strong>৳{shop.delivery_inside_city}</strong></span>}
          {shop.delivery_outside_city>0 && <span>🗺️ Outside City: <strong>৳{shop.delivery_outside_city}</strong></span>}
        </div>
      )}

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'2rem 5vw' }}>
        <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:theme.primary, marginBottom:'1.25rem' }}>
          {products.length} Products
        </h2>
        {products.length===0 ? (
          <p style={{ color:theme.text, opacity:.5, textAlign:'center', padding:'3rem 0' }}>No products listed yet.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:isPremium?'repeat(auto-fill,minmax(250px,1fr))':'repeat(auto-fill,minmax(200px,1fr))', gap:isPremium?'1.25rem':'1rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ background:theme.cardBg, borderRadius:isPremium?'16px':'12px', border:`1px solid ${theme.primary}18`, overflow:'hidden', transition:'transform .2s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-3px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                <div style={{ height:isPremium?'140px':'110px', background:`${theme.primary}08`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem' }}>
                  🛍️
                </div>
                <div style={{ padding:isPremium?'1rem':'0.85rem' }}>
                  <div style={{ fontWeight:700, color:theme.primary, fontSize:isPremium?'1rem':'0.95rem', marginBottom:'4px' }}>{p.name}</div>
                  {p.description && <div style={{ fontSize:'12px', color:theme.text, opacity:.6, marginBottom:'8px' }}>{p.description}</div>}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontWeight:800, color:theme.accent, fontSize:isPremium?'1.1rem':'1rem' }}>৳{p.selling_price||p.price}</span>
                    <button onClick={()=>addToCart(p)}
                      style={{ background:theme.primary, color:theme.navText, border:'none', padding:'.4rem .9rem', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'13px' }}>
                      + Add
                    </button>
                  </div>
                  {p.stock <= 5 && p.stock > 0 && <div style={{ fontSize:'11px', color:'#DC2626', marginTop:'4px' }}>Only {p.stock} left!</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart sidebar */}
      {showCart && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={()=>setShowCart(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)' }}/>
          <div style={{ position:'relative', width:'min(400px,100vw)', background:theme.cardBg, height:'100vh', overflowY:'auto', padding:'1.5rem', boxShadow:'-8px 0 32px rgba(0,0,0,.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ fontWeight:800, color:theme.primary }}>Your Cart</h3>
              <button onClick={()=>setShowCart(false)} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:theme.text }}>✕</button>
            </div>

            {!checkout ? (
              <>
                {cart.length===0 ? <p style={{ color:theme.text, opacity:.5 }}>Your cart is empty.</p> : (
                  <>
                    {cart.map(item=>(
                      <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.85rem 0', borderBottom:`1px solid ${theme.primary}15` }}>
                        <div>
                          <div style={{ fontWeight:600, color:theme.primary, fontSize:'14px' }}>{item.name}</div>
                          <div style={{ fontSize:'12px', color:theme.text, opacity:.6 }}>৳{item.selling_price||item.price} × {item.qty}</div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                          <span style={{ fontWeight:700, color:theme.primary }}>৳{(item.selling_price||item.price)*item.qty}</span>
                          <button onClick={()=>removeFromCart(item.id)} style={{ background:'#FEE2E2', color:'#DC2626', border:'none', width:'24px', height:'24px', borderRadius:'50%', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop:'1.5rem', padding:'1rem', background:`${theme.primary}08`, borderRadius:'10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:theme.text, marginBottom:'6px' }}>
                        <span>Subtotal</span><span>৳{subtotal}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:theme.text, marginBottom:'10px' }}>
                        <span>Delivery (est.)</span><span>৳{shop.delivery_inside_city||0}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, color:theme.primary, fontSize:'16px' }}>
                        <span>Total</span><span>৳{subtotal+(shop.delivery_inside_city||0)}</span>
                      </div>
                    </div>
                    <button onClick={()=>setCheckout(true)} style={{ width:'100%', background:theme.primary, color:theme.navText, border:'none', padding:'.85rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', marginTop:'1rem', fontSize:'15px' }}>
                      Checkout →
                    </button>
                  </>
                )}
              </>
            ) : (
              <div>
                <h4 style={{ color:theme.primary, fontWeight:700, marginBottom:'1rem' }}>Complete Your Order</h4>
                {[
                  { key:'name', label:'Full Name', placeholder:'Your name' },
                  { key:'phone', label:'Phone Number', placeholder:'01XXXXXXXXX' },
                  { key:'address', label:'Delivery Address', placeholder:'Full address' },
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:'.85rem' }}>
                    <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:theme.text, marginBottom:'4px', opacity:.7 }}>{f.label}</label>
                    <input style={{ width:'100%', padding:'.7rem 1rem', borderRadius:'8px', border:`1.5px solid ${theme.primary}30`, fontSize:'14px', color:theme.text, background:theme.bg, outline:'none', boxSizing:'border-box' as const }}
                      placeholder={f.placeholder} value={(orderForm as any)[f.key]} onChange={e=>setOrderForm(p=>({...p,[f.key]:e.target.value}))} />
                  </div>
                ))}
                <div style={{ marginBottom:'.85rem' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:theme.text, marginBottom:'4px', opacity:.7 }}>Delivery Zone</label>
                  <select style={{ width:'100%', padding:'.7rem 1rem', borderRadius:'8px', border:`1.5px solid ${theme.primary}30`, fontSize:'14px', color:theme.text, background:theme.bg, outline:'none' }}
                    value={orderForm.delivery} onChange={e=>setOrderForm(p=>({...p,delivery:e.target.value}))}>
                    <option value="inside">Inside City — ৳{shop.delivery_inside_city||0}</option>
                    <option value="outside">Outside City — ৳{shop.delivery_outside_city||0}</option>
                  </select>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:theme.text, marginBottom:'4px', opacity:.7 }}>Payment Method</label>
                  <select style={{ width:'100%', padding:'.7rem 1rem', borderRadius:'8px', border:`1.5px solid ${theme.primary}30`, fontSize:'14px', color:theme.text, background:theme.bg, outline:'none' }}
                    value={orderForm.payment} onChange={e=>setOrderForm(p=>({...p,payment:e.target.value}))}>
                    <option value="cod">Cash on Delivery</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="stripe">Card (Stripe)</option>
                  </select>
                </div>
                <div style={{ padding:'1rem', background:`${theme.primary}08`, borderRadius:'10px', marginBottom:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:theme.text, marginBottom:'4px' }}>
                    <span>Subtotal</span><span>৳{subtotal}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:theme.text, marginBottom:'8px' }}>
                    <span>Delivery</span><span>৳{deliveryCharge}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, color:theme.primary }}>
                    <span>Total</span><span>৳{total}</span>
                  </div>
                </div>
                <button onClick={placeOrder} disabled={placing} style={{ width:'100%', background:theme.primary, color:theme.navText, border:'none', padding:'.85rem', borderRadius:'10px', fontWeight:700, cursor:'pointer', fontSize:'15px', opacity:placing?.7:1 }}>
                  {placing?'Placing Order...':'🎉 Place Order'}
                </button>
                <button onClick={()=>setCheckout(false)} style={{ width:'100%', background:'none', color:theme.text, border:'none', padding:'.5rem', cursor:'pointer', fontSize:'13px', marginTop:'.5rem', opacity:.6 }}>← Back to Cart</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}