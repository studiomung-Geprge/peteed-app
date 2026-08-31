import { useState, useEffect, type ReactElement } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, SUPABASE_ENABLED } from './lib/supabase'
import { ensureMyPet } from './lib/petData'
import LoginScreen from './LoginScreen'
import QRModal from './QRModal'
import PetPhotoCapture from './PetPhotoCapture'
import { Icons } from './icons'
import HomeTab from './tabs/HomeTab'
import WalletTab from './tabs/WalletTab'
import HealthTab from './tabs/HealthTab'
import FacilitiesTab from './tabs/FacilitiesTab'
import EmergencyTab from './tabs/EmergencyTab'
import HealthRecordModal from './modals/HealthRecordModal'
import GovIdModal from './modals/GovIdModal'
import MapPopupModal from './modals/MapPopupModal'

type TabId = 'home' | 'wallet' | 'health' | 'facilities' | 'emergency'

const TAB_ICONS: Record<TabId, (c?: string) => ReactElement> = {
  home: Icons.home,
  wallet: Icons.id,
  health: Icons.heart,
  facilities: Icons.building,
  emergency: Icons.emergency,
}

const TAB_LABELS: Record<TabId, string> = {
  home: '홈', wallet: '신분증', health: '건강기록',
  facilities: '시설예약', emergency: '응급',
}

export default function App() {
  // `session` reflects a real Supabase-authenticated user; `demoLoggedIn`
  // covers the simulated social-login buttons and any environment where
  // Supabase isn't reachable (e.g. inside a Claude Artifact preview, whose
  // sandbox blocks calls to *.supabase.co). Either one lets the user in.
  const [session, setSession] = useState<Session | null>(null)
  const [demoLoggedIn, setDemoLoggedIn] = useState(false)
  const loggedIn = Boolean(session) || demoLoggedIn
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [showQR, setShowQR] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [govIdModal, setGovIdModal] = useState<null | 'A' | 'B'>(null)
  const [healthRecord, setHealthRecord] = useState<null | number>(null)
  const [mapPopup, setMapPopup] = useState<null | string>(null)
  const [petPhoto, setPetPhoto] = useState('https://images.unsplash.com/photo-1736196674354-b5e918a64644?w=400&h=400&fit=crop&crop=face')
  const [petBreed, setPetBreed] = useState('사모예드 · 4세 · 남아(중성화) · MANDU')

  // Pick up an existing Supabase session on load and keep it in sync.
  useEffect(() => {
    if (!SUPABASE_ENABLED || !supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // On first login for a real Supabase user, provision (or fetch) their
  // pet row so the passport card reflects a real database record.
  useEffect(() => {
    if (!session?.user) return
    ensureMyPet(session.user.id)
      .then(pet => { if (pet?.photo_url) setPetPhoto(pet.photo_url) })
      .catch(err => console.warn('ensureMyPet failed:', err))
  }, [session?.user?.id])

  if (!loggedIn) return <LoginScreen onLogin={() => setDemoLoggedIn(true)} />

  const switchTab = (tab: TabId) => setActiveTab(tab)

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut().catch(() => {})
    setSession(null)
    setDemoLoggedIn(false)
  }

  const handleRegister = (photo: string, result: { breed: string; age: string; gender: string }) => {
    setPetPhoto(photo)
    setPetBreed(`${result.breed} · ${result.age} · ${result.gender}`)
    setShowCamera(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="pl-device">
        <div className="pl-screen">
          {showQR && <QRModal onClose={() => setShowQR(false)} />}
          {showCamera && <PetPhotoCapture onClose={() => setShowCamera(false)} onRegister={handleRegister} />}
          {govIdModal && <GovIdModal guardian={govIdModal} onClose={() => setGovIdModal(null)} />}
          {healthRecord !== null && <HealthRecordModal id={healthRecord} onClose={() => setHealthRecord(null)} />}
          {mapPopup && <MapPopupModal location={mapPopup} onClose={() => setMapPopup(null)} />}
          <div className="pl-dyn-island" />
          <div className="pl-status-bar">
            <span>9:41</span>
            <div className="icons">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <rect x="0" y="7" width="3" height="5" rx="0.5" fill="#16233D"/>
                <rect x="5" y="5" width="3" height="7" rx="0.5" fill="#16233D"/>
                <rect x="10" y="2" width="3" height="10" rx="0.5" fill="#16233D"/>
                <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#16233D"/>
              </svg>
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#16233D"/>
                <rect x="2" y="2" width="14" height="8" rx="1.6" fill="#16233D"/>
                <rect x="22.5" y="4" width="1.5" height="4" rx="0.7" fill="#16233D"/>
              </svg>
            </div>
          </div>

          <div className="pl-content">
            <div className={`pl-page${activeTab === 'home' ? ' active' : ''}`}>
              <HomeTab
                petPhoto={petPhoto}
                petBreed={petBreed}
                onPhotoClick={() => setShowCamera(true)}
                onQRClick={() => setShowQR(true)}
                onViewAllClick={() => switchTab('health')}
                onLogout={handleLogout}
              />
            </div>

            <div className={`pl-page${activeTab === 'wallet' ? ' active' : ''}`}>
              <WalletTab
                onQRClick={() => setShowQR(true)}
                onSelectRecord={id => setHealthRecord(id)}
                onSelectGuardian={g => setGovIdModal(g)}
              />
            </div>

            <div className={`pl-page${activeTab === 'health' ? ' active' : ''}`}>
              <HealthTab
                onOpenCamera={() => setShowCamera(true)}
                onSelectRecord={id => setHealthRecord(id)}
              />
            </div>

            <div className={`pl-page${activeTab === 'facilities' ? ' active' : ''}`}>
              <FacilitiesTab />
            </div>

            <div className={`pl-page${activeTab === 'emergency' ? ' active' : ''}`}>
              <EmergencyTab onOpenMap={loc => setMapPopup(loc)} />
            </div>
          </div>

          <div className="pl-tabbar">
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,.12)', margin: '0 auto 8px' }} />
            <div style={{ display: 'flex', width: '100%' }}>
              {(['home', 'wallet', 'health', 'facilities', 'emergency'] as TabId[]).map((tab) => {
                const isActive = activeTab === tab
                const color = isActive ? 'var(--ink)' : 'var(--ink-45)'
                return (
                  <button
                    key={tab}
                    className={`pl-tab${isActive ? ' active' : ''}`}
                    onClick={() => switchTab(tab)}
                  >
                    <span className="ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {TAB_ICONS[tab](color)}
                    </span>
                    {TAB_LABELS[tab]}
                    <span className="dot" />
                  </button>
                )
              })}
            </div>
            <div className="pl-home-indicator" />
          </div>
        </div>
      </div>
      <div className="device-label">iPhone 17 Pro · 402 × 874pt viewport</div>
    </div>
  )
}
