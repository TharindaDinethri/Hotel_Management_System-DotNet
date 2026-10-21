import { useEffect, useState, FormEvent } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { BedDouble, CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, ClipboardList, DoorOpen, Hotel, LayoutDashboard, LogOut, Menu, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import { api, money, Room, User } from './api'

const fallbackRooms: Room[] = [
  { id: 1, name: 'Deluxe King Room', roomNumber: '101', category: 'Deluxe', capacity: 2, pricePerNight: 18000, description: 'A calm, beautifully appointed room with a king bed, air conditioning and complimentary Wi-Fi.', imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', status: 'Available' },
  { id: 2, name: 'Ocean View Suite', roomNumber: '201', category: 'Suite', capacity: 3, pricePerNight: 32000, description: 'A generous suite with a relaxing lounge area and elevated amenities for a special stay.', imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', status: 'Available' },
  { id: 3, name: 'Family Comfort Room', roomNumber: '105', category: 'Family', capacity: 4, pricePerNight: 26000, description: 'Extra space for families, with flexible sleeping arrangements and thoughtful comforts.', imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', status: 'Available' },
]
type Booking = { id: number; roomName: string; roomCategory?: string; customerName?: string; customerEmail?: string; checkIn: string; checkOut: string; guests: number; totalPrice: number; status: string; createdAtUtc?: string }

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => { api<User>('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)) }, [])
  async function logout() { try { await api('/auth/logout', { method: 'POST' }) } finally { setUser(null); window.location.href = '/' } }
  if (checking) return <div className="loading-screen"><div className="brand-mark"><Hotel /></div><p>Preparing your stay...</p></div>
  return <div className="app-shell">
    <header className="site-header">
      <Link to="/" className="brand"><span className="brand-mark"><Hotel size={21}/></span><span>stay<span className="brand-light">ease</span><small>HOTEL & RESERVATIONS</small></span></Link>
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X/> : <Menu/>}</button>
      <nav className={mobileOpen ? 'main-nav open' : 'main-nav'}>
        <NavLink to="/" onClick={() => setMobileOpen(false)}>Discover</NavLink>
        <a href="/#rooms" onClick={() => setMobileOpen(false)}>Our rooms</a>
        {user?.role === 'Customer' && <NavLink to="/my-bookings">My bookings</NavLink>}
        {(user?.role === 'Staff' || user?.role === 'Admin') && <NavLink to="/staff">Staff portal</NavLink>}
        {!user ? <><Link className="nav-login" to="/customer-login">Customer login</Link><Link className="button button-dark button-small" to="/staff-login">Staff portal <ChevronRight size={15}/></Link></> :
          <button className="user-pill" onClick={logout}><CircleUserRound size={17}/>{user.fullName.split(' ')[0]} <LogOut size={15}/></button>}
      </nav>
    </header>
    <Routes>
      <Route path="/" element={<Home user={user}/>} />
      <Route path="/customer-login" element={<AuthPage mode="customer" onLogin={setUser}/>} />
      <Route path="/staff-login" element={<AuthPage mode="staff" onLogin={setUser}/>} />
      <Route path="/my-bookings" element={<Protected user={user} role="Customer"><MyBookings/></Protected>} />
      <Route path="/staff" element={<Protected user={user} role="Staff"><StaffDashboard user={user}/></Protected>} />
      <Route path="*" element={<Home user={user}/>} />
    </Routes>
    <footer className="footer"><Link to="/" className="brand footer-brand"><span className="brand-mark"><Hotel size={18}/></span><span>stayease<small>MAKE ROOM FOR GOOD THINGS</small></span></Link><span>Thoughtfully designed stays. Seamlessly managed.</span><span>© {new Date().getFullYear()} StayEase</span></footer>
  </div>
}

function Home({ user }: { user: User | null }) {
  const [rooms, setRooms] = useState<Room[]>(fallbackRooms)
  const [checkIn, setCheckIn] = useState(new Date(Date.now() + 86400000).toISOString().slice(0,10))
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 3*86400000).toISOString().slice(0,10))
  const [guests, setGuests] = useState(2)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  async function search(e?: FormEvent) {
    e?.preventDefault(); setBusy(true); setNotice('')
    try { const data = await api<Room[]>(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`); setRooms(data); if (!data.length) setNotice('No rooms match those dates and guest numbers. Try different dates.') }
    catch { setRooms(fallbackRooms); setNotice('Showing preview rooms. Start the backend and database to search live availability.') }
    finally { setBusy(false); document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' }) }
  }
  async function book(room: Room) {
    if (!user) { window.location.href = '/customer-login'; return }
    if (user.role !== 'Customer') { setNotice('Please use a customer account to make a reservation.'); return }
    try {
      const result = await api<{id:number}>('/reservations', { method: 'POST', body: JSON.stringify({ roomId: room.id, checkIn, checkOut, guests }) })
      setNotice(`Reservation #${result.id} created. It is pending staff confirmation. Open My bookings to review it.`)
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not create reservation.') }
  }
  return <>
    <main>
      <section className="hero">
        <div className="hero-image"></div><div className="hero-shade"></div>
        <div className="hero-content"><div className="eyebrow light"><Sparkles size={15}/> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Stay somewhere<br/><em>you’ll remember.</em></h1>
          <p>Thoughtful spaces, warm hospitality, and the little details that turn a trip into a story.</p>
          <a href="#rooms" className="button button-cream">Explore our rooms <ChevronRight size={17}/></a>
          <div className="hero-proof"><span><CheckCircle2 size={15}/> Thoughtful comfort</span><span><CheckCircle2 size={15}/> Easy reservations</span><span><CheckCircle2 size={15}/> Personal service</span></div>
        </div>
        <div className="hero-note"><span className="note-line"></span><span>THE ART OF A GOOD STAY</span></div>
      </section>
      <section className="search-wrap">
        <form className="search-panel" onSubmit={search}>
          <div className="search-title"><span className="search-icon"><CalendarDays/></span><div><strong>Find your stay</strong><small>Choose your dates and we’ll take care of the rest.</small></div></div>
          <label>CHECK IN<input type="date" value={checkIn} min={new Date().toISOString().slice(0,10)} onChange={e => setCheckIn(e.target.value)} required/></label>
          <label>CHECK OUT<input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} required/></label>
          <label>GUESTS<select value={guests} onChange={e => setGuests(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>)}</select></label>
          <button className="button button-dark search-button" disabled={busy}>{busy ? 'Searching...' : 'Search rooms'} <ChevronRight size={17}/></button>
        </form>
      </section>
      <section className="section rooms-section" id="rooms">
        <div className="section-heading"><div><div className="eyebrow">YOUR SPACE TO UNWIND</div><h2>Rooms made for <em>recharging.</em></h2></div><p>From a quick escape to a longer stay, find a space that feels just right.</p></div>
        {notice && <div className="notice">{notice}</div>}
        <div className="room-grid">{rooms.map((room, i)=><article className="room-card" key={room.id}>
          <div className="room-photo"><img src={room.imageUrl || fallbackRooms[i%fallbackRooms.length].imageUrl} alt={room.name}/><span className="room-tag">{room.category}</span><span className="photo-count"><Sparkles size={13}/> Curated comfort</span></div>
          <div className="room-info"><div className="room-meta"><span><Users size={15}/> Up to {room.capacity} guests</span><span><BedDouble size={15}/> Private room</span></div><h3>{room.name}</h3><p>{room.description}</p><div className="room-bottom"><div><strong>{money(room.pricePerNight)}</strong><span> / night</span></div><button className="text-button" onClick={() => book(room)}>Reserve <ChevronRight size={16}/></button></div></div>
        </article>)}</div>
      </section>
      <section className="experience"><div className="experience-image"></div><div className="experience-copy"><div className="eyebrow light">MORE THAN A ROOM</div><h2>Arrive as a guest.<br/><em>Leave feeling renewed.</em></h2><p>We believe the best stays feel effortless. Thoughtful spaces, clear booking, and a team ready to help make every moment count.</p><div className="experience-points"><span><CheckCircle2/> Comfortable, considered rooms</span><span><CheckCircle2/> Simple reservation management</span><span><CheckCircle2/> Friendly service at every step</span></div></div></section>
      <section className="section trust-section"><div className="eyebrow">A BETTER WAY TO STAY</div><h2>Little things. <em>Big difference.</em></h2><div className="trust-grid"><div><span className="trust-icon"><ShieldCheck/></span><h3>Book with confidence</h3><p>Clear reservation details and a simple way to manage your stay.</p></div><div><span className="trust-icon"><CalendarDays/></span><h3>Your dates, your plans</h3><p>Search by dates and guest count to find the right room.</p></div><div><span className="trust-icon"><Users/></span><h3>People who care</h3><p>A dedicated staff portal keeps the team organised behind the scenes.</p></div></div></section>
      <section className="closing-cta"><div><div className="eyebrow light">YOUR ROOM IS WAITING</div><h2>Make a little room<br/>for <em>something lovely.</em></h2></div><a href="#rooms" className="button button-cream">Find your stay <ChevronRight size={17}/></a></section>
    </main>
  </>
}

function AuthPage({ mode, onLogin }: { mode: 'customer'|'staff'; onLogin: (u:User)=>void }) {
  const [register, setRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const isStaff = mode === 'staff'
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      const path = register ? '/auth/register' : isStaff ? '/auth/staff-login' : '/auth/customer-login'
      const user = await api<User>(path, { method:'POST', body: JSON.stringify(register ? {fullName,email,password} : {email,password}) })
      onLogin(user); nav(user.role === 'Customer' ? '/' : '/staff')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in. Check that the backend is running.') }
    finally { setBusy(false) }
  }
  return <main className="auth-page"><div className="auth-visual"><div className="auth-visual-bg"></div><div className="auth-visual-content"><span className="brand-mark"><Hotel/></span><div className="eyebrow light">{isStaff ? 'THE TEAM BEHIND THE STAY' : 'YOUR STAY, YOUR WAY'}</div><h1>{isStaff ? <>Great stays start<br/>with <em>great people.</em></> : <>A softer landing<br/>for <em>your next trip.</em></>}</h1><p>{isStaff ? 'Manage reservations, welcome guests, and keep every detail running smoothly.' : 'Sign in to keep your plans together and make your next getaway effortless.'}</p></div></div>
    <div className="auth-form-wrap"><div className="auth-form">
      <Link to="/" className="back-link">← Back to StayEase</Link><div className="eyebrow">{isStaff ? 'STAFF ACCESS' : 'WELCOME BACK'}</div><h2>{register ? 'Create your account' : isStaff ? 'Staff sign in' : 'Sign in to StayEase'}</h2><p className="auth-sub">{register ? 'Create an account to start booking your stay.' : isStaff ? 'Access the secure team workspace.' : 'Your next great stay is just a few clicks away.'}</p>
      <div className="portal-switch"><Link className={!isStaff?'selected':''} to="/customer-login"><CircleUserRound size={16}/> Customer</Link><Link className={isStaff?'selected':''} to="/staff-login"><ShieldCheck size={16}/> Staff</Link></div>
      <form onSubmit={submit} className="form-stack">{register && <label>FULL NAME<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" required/></label>}<label>EMAIL ADDRESS<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="username"/></label><label>PASSWORD<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={register?'At least 8 characters':'Enter your password'} required minLength={register?8:1} autoComplete={register?'new-password':'current-password'}/></label>
      {error && <div className="error-message">{error}</div>}<button className="button button-dark full-button" disabled={busy}>{busy ? 'Please wait...' : register ? 'Create account' : 'Sign in securely'} <ChevronRight size={17}/></button></form>
      {!isStaff && <p className="auth-switch">{register?'Already have an account?':'New to StayEase?'} <button onClick={()=>{setRegister(!register);setError('')}}>{register?'Sign in':'Create an account'}</button></p>}
      {isStaff && <div className="security-note"><ShieldCheck size={18}/><span>Staff access is restricted to authorised team accounts. Customer accounts cannot access this portal.</span></div>}
      <div className="auth-legal">By continuing, you agree to our terms and privacy policy.</div>
    </div></div></main>
}

function Protected({ user, role, children }: { user: User|null; role: string; children: React.ReactNode }) {
  const nav = useNavigate()
  useEffect(()=>{ if(user && role === 'Staff' && !['Staff','Admin'].includes(user.role)) nav('/staff-login'); else if(user && role !== 'Staff' && user.role !== role) nav('/customer-login') },[user,role,nav])
  if(!user) return <div className="protected-message"><ShieldCheck size={32}/><h2>Sign in to continue</h2><p>This area is available to authorised account holders.</p><Link className="button button-dark" to={role==='Staff'?'/staff-login':'/customer-login'}>Continue to sign in <ChevronRight size={16}/></Link></div>
  if(role==='Staff' && !['Staff','Admin'].includes(user.role)) return null
  if(role!=='Staff' && user.role!==role) return null
  return <>{children}</>
}

function MyBookings() {
  const [items,setItems] = useState<Booking[]>([])
  const [error,setError] = useState('')
  async function load(){try{setItems(await api<Booking[]>('/reservations/my'));setError('')}catch(e){setError(e instanceof Error?e.message:'Could not load bookings.')}}
  useEffect(()=>{load()},[])
  async function cancel(id:number){try{await api(`/reservations/${id}/cancel`,{method:'POST'});load()}catch(e){setError(e instanceof Error?e.message:'Could not cancel booking.')}}
  return <main className="dashboard-page"><div className="dashboard-title"><div className="eyebrow">YOUR ACCOUNT</div><h1>My <em>reservations.</em></h1><p>All your plans, in one place.</p></div>{error&&<div className="notice">{error}</div>}{!items.length&&!error?<div className="empty-state"><CalendarDays size={34}/><h3>No reservations yet</h3><p>When you book a room, your reservation will appear here.</p><Link to="/#rooms" className="button button-dark">Explore rooms</Link></div>:<div className="booking-list">{items.map(b=><article className="booking-row" key={b.id}><div className="booking-icon"><BedDouble/></div><div className="booking-main"><span className="eyebrow">RESERVATION #{b.id}</span><h3>{b.roomName}</h3><p>{new Date(b.checkIn).toLocaleDateString()} — {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests</p></div><div className="booking-end"><strong>{money(b.totalPrice)}</strong><span className={`status status-${b.status.toLowerCase()}`}>{b.status}</span>{!['Cancelled','Completed'].includes(b.status)&&<button className="text-button danger" onClick={()=>cancel(b.id)}>Cancel booking</button>}</div></article>)}</div>}</main>
}

function StaffDashboard({ user }: { user: User|null }) {
  const [tab,setTab] = useState<'overview'|'reservations'|'rooms'>('overview')
  const [stats,setStats] = useState<any>(null)
  const [bookings,setBookings] = useState<Booking[]>([])
  const [rooms,setRooms] = useState<Room[]>([])
  const [error,setError] = useState('')
  const [roomForm,setRoomForm] = useState({name:'',roomNumber:'',category:'Standard',capacity:2,pricePerNight:15000,description:'',imageUrl:''})
  async function load() {
    try { const [s,b,r]=await Promise.all([api<any>('/staff/dashboard'),api<Booking[]>('/staff/reservations'),api<Room[]>('/staff/rooms')]);setStats(s);setBookings(b);setRooms(r);setError('') }
    catch(e){setError(e instanceof Error?e.message:'Could not load staff data.')}
  }
  useEffect(()=>{load()},[])
  async function status(id:number, status:string){try{await api(`/staff/reservations/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});load()}catch(e){setError(e instanceof Error?e.message:'Update failed.')}}
  async function addRoom(e:FormEvent){e.preventDefault();try{await api('/staff/rooms',{method:'POST',body:JSON.stringify(roomForm)});setRoomForm({name:'',roomNumber:'',category:'Standard',capacity:2,pricePerNight:15000,description:'',imageUrl:''});load()}catch(e){setError(e instanceof Error?e.message:'Could not add room.')}}
  return <main className="staff-page"><aside className="staff-sidebar"><div className="staff-brand"><span className="brand-mark"><Hotel/></span><div>stay<span>ease</span><small>TEAM WORKSPACE</small></div></div><div className="staff-user"><div className="avatar">{user?.fullName.slice(0,1).toUpperCase()}</div><div><strong>{user?.fullName}</strong><small>{user?.role}</small></div></div><nav><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><LayoutDashboard/>Overview</button><button className={tab==='reservations'?'active':''} onClick={()=>setTab('reservations')}><ClipboardList/>Reservations</button><button className={tab==='rooms'?'active':''} onClick={()=>setTab('rooms')}><DoorOpen/>Rooms</button></nav><div className="sidebar-bottom"><ShieldCheck size={16}/> Secure staff access</div></aside>
    <section className="staff-content"><div className="staff-topbar"><div><span className="eyebrow">STAYEASE OPERATIONS</span><h1>{tab==='overview'?'Good work starts here.':tab==='reservations'?'Reservation management.':'Room management.'}</h1></div><button className="button button-outline button-small" onClick={load}>Refresh data</button></div>
      {error&&<div className="notice">{error}</div>}
      {tab==='overview'&&<><p className="staff-intro">Here’s what’s happening with your property today.</p><div className="stat-grid">{[{label:'Total active rooms',value:stats?.totalRooms??'—',icon:<BedDouble/>},{label:'Active reservations',value:stats?.activeReservations??'—',icon:<ClipboardList/>},{label:"Today's arrivals",value:stats?.arrivalsToday??'—',icon:<Users/>},{label:'Awaiting confirmation',value:stats?.pendingReservations??'—',icon:<CalendarDays/>}].map(s=><div className="stat-card" key={s.label}><span>{s.icon}</span><small>{s.label}</small><strong>{s.value}</strong></div>)}</div><div className="panel"><div className="panel-heading"><div><div className="eyebrow">RECENT ACTIVITY</div><h2>Latest reservations</h2></div><button className="text-button" onClick={()=>setTab('reservations')}>View all <ChevronRight size={15}/></button></div><ReservationTable items={bookings.slice(0,5)} onStatus={status}/></div></>}
      {tab==='reservations'&&<div className="panel"><div className="panel-heading"><div><div className="eyebrow">GUEST BOOKINGS</div><h2>All reservations</h2></div></div><ReservationTable items={bookings} onStatus={status}/></div>}
      {tab==='rooms'&&<><div className="panel"><div className="panel-heading"><div><div className="eyebrow">INVENTORY</div><h2>Room inventory</h2></div></div><div className="room-admin-list">{rooms.map(r=><div className="room-admin-row" key={r.id}><div className="room-admin-icon"><BedDouble/></div><div><strong>{r.name}</strong><small>Room {r.roomNumber} · {r.category} · Up to {r.capacity} guests</small></div><strong>{money(r.pricePerNight)}<small> / night</small></strong><span className="status status-confirmed">{r.status}</span></div>)}</div></div>{user?.role==='Admin'&&<div className="panel add-room-panel"><div className="eyebrow">ADMIN ONLY</div><h2>Add a room</h2><form className="room-form" onSubmit={addRoom}><label>Room name<input required value={roomForm.name} onChange={e=>setRoomForm({...roomForm,name:e.target.value})}/></label><label>Room number<input required value={roomForm.roomNumber} onChange={e=>setRoomForm({...roomForm,roomNumber:e.target.value})}/></label><label>Category<select value={roomForm.category} onChange={e=>setRoomForm({...roomForm,category:e.target.value})}><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Family</option></select></label><label>Capacity<input type="number" min="1" max="10" value={roomForm.capacity} onChange={e=>setRoomForm({...roomForm,capacity:Number(e.target.value)})}/></label><label>Price per night (LKR)<input type="number" min="1" value={roomForm.pricePerNight} onChange={e=>setRoomForm({...roomForm,pricePerNight:Number(e.target.value)})}/></label><label>Image URL<input value={roomForm.imageUrl} onChange={e=>setRoomForm({...roomForm,imageUrl:e.target.value})}/></label><label className="wide">Description<textarea value={roomForm.description} onChange={e=>setRoomForm({...roomForm,description:e.target.value})}/></label><button className="button button-dark">Add room</button></form></div>}</>}
    </section></main>
}

function ReservationTable({items,onStatus}:{items:Booking[];onStatus:(id:number,s:string)=>void}) {
  if(!items.length)return <div className="table-empty">No reservations to show yet.</div>
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>Guest / booking</th><th>Stay dates</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>{items.map(b=><tr key={b.id}><td><strong>{b.customerName||`Reservation #${b.id}`}</strong><small>{b.customerEmail||b.roomName}</small></td><td>{new Date(b.checkIn).toLocaleDateString()}<small>to {new Date(b.checkOut).toLocaleDateString()}</small></td><td>{money(b.totalPrice)}</td><td><span className={`status status-${b.status.toLowerCase()}`}>{b.status}</span></td><td><select className="status-select" value={b.status} onChange={e=>onStatus(b.id,e.target.value)}><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>CheckedIn</option><option>Completed</option></select></td></tr>)}</tbody></table></div>
}
export default App
