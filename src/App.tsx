import { useState, useEffect, type ReactElement } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, SUPABASE_ENABLED } from './lib/supabase'
import { getMyPet, createMyPet, updateGuardianName, updatePetName, getGuardianName } from './lib/petData'
import { HEALTH_RECORDS, type HealthRecord } from './data/healthRecords'
import LoginScreen from './LoginScreen'
import OnboardingScreen from './OnboardingScreen'
import QRModal from './QRModal'
import PetPhotoCapture from './PetPhotoCapture'
import HealthDocCapture from './HealthDocCapture'
import { Icons } from './icons'
import HomeTab from './tabs/HomeTab'
import WalletTab from './tabs/WalletTab'
import HealthTab from './tabs/HealthTab'
import FacilitiesTab from './tabs/FacilitiesTab'
import EmergencyTab from './tabs/EmergencyTab'
import HealthRecordModal from './modals/HealthRecordModal'
import GovIdModal from './modals/GovIdModal'
import MapPopupModal from './modals/MapPopupModal'
import EditProfileModal from './modals/EditProfileModal'

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
  const [showHealthCapture, setShowHealthCapture] = useState(false)
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(HEALTH_RECORDS)
  const [govIdModal, setGovIdModal] = useState<null | 'A' | 'B'>(null)
  const [healthRecord, setHealthRecord] = useState<null | number>(null)
  const [mapPopup, setMapPopup] = useState<null | string>(null)
  const [petPhoto, setPetPhoto] = useState('https://images.unsplash.com/photo-1736196674354-b5e918a64644?w=400&h=400&fit=crop&crop=face')
  const [petBreed, setPetBreed] = useState('사모예드 · 4세 · 남아(중성화) · MANDU')
  const [petName, setPetName] = useState('만두')
  const [petId, setPetId] = useState<string | null>(null)
  // Sample value — there's no blood_type column in the `pets` table yet, so
  // this is edited locally only (like petBreed) rather than persisted.
  const [petBloodType, setPetBloodType] = useState('DEA 1.1 양성')
  const [guardianName, setGuardianName] = useState('죠지')
  const [showEditProfile, setShowEditProfile] = useState(false)
  // null = not checked yet, true = real Supabase user with no pet on file
  // (needs the one-time onboarding form), false = ready to show the app.
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)

  // Pick up an existing Supabase session on load and keep it in sync.
  useEffect(() => {
    if (!SUPABASE_ENABLED || !supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // On login for a real Supabase user, check whether they already have a
  // pet on file. If not, this is their first time in — show the onboarding
  // form instead of a hardcoded "만두" placeholder.
  useEffect(() => {
    if (!session?.user) { setNeedsOnboarding(false); return }
    Promise.all([getMyPet(session.user.id), getGuardianName(session.user.id)])
      .then(([pet, fullName]) => {
        if (fullName) setGuardianName(fullName)
        if (pet) {
          setPetName(pet.name)
          setPetId(pet.id)
          if (pet.photo_url) setPetPhoto(pet.photo_url)
          setNeedsOnboarding(false)
        } else {
          setNeedsOnboarding(true)
        }
      })
      .catch(err => { console.warn('profile/pet fetch failed:', err); setNeedsOnboarding(false) })
  }, [session?.user?.id])

  const handleOnboardingComplete = async (newGuardianName: string, newPetName: string) => {
    if (!session?.user) return
    try {
      const [, pet] = await Promise.all([
        updateGuardianName(session.user.id, newGuardianName),
        createMyPet(session.user.id, newPetName),
      ])
      setGuardianName(newGuardianName)
      setPetName(newPetName)
      setPetId(pet.id)
      setNeedsOnboarding(false)
    } catch (err) {
      console.warn('onboarding save failed:', err)
      // Don't strand the user on the form if the DB write fails — let them
      // into the app with the name they just typed; it just won't be saved.
      setGuardianName(newGuardianName)
      setPetName(newPetName)
      setNeedsOnboarding(false)
    }
  }

  const handleEditProfileSave = async (newGuardianName: string, newPetName: string, newBloodType: string) => {
    if (session?.user) {
      try {
        const updates: Promise<unknown>[] = [updateGuardianName(session.user.id, newGuardianName)]
        if (petId) updates.push(updatePetName(petId, newPetName))
        await Promise.all(updates)
      } catch (err) {
        console.warn('edit profile save failed:', err)
      }
    }
    setGuardianName(newGuardianName)
    setPetName(newPetName)
    setPetBloodType(newBloodType)
    setShowEditProfile(false)
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setDemoLoggedIn(true)} />

  if (needsOnboarding) return <OnboardingScreen onComplete={handleOnboardingComplete} />

  // Real Supabase session, but we haven't finished checking for an existing
  // pet yet — avoid flashing the placeholder "만두" home screen before we
  // know whether onboarding is actually needed.
  if (session?.user && needsOnboarding === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="pl-device">
          <div className="pl-screen" style={{ background: '#FFF8F5', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #FFD9CB', borderTopColor: '#FF6B4A', display: 'inline-block', animation: 'app-spin .7s linear infinite' }} />
            <style>{`@keyframes app-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        </div>
      </div>
    )
  }

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

  const handleHealthRecordAdd = (record: HealthRecord) => {
    setHealthRecords(prev => {
      const next = [...prev, record]
      setHealthRecord(next.length - 1)
      return next
    })
    setShowHealthCapture(false)
    switchTab('health')
  }

  const handleQuickAction = (key: 'health' | 'facilities' | 'missing' | 'blood') => {
    switch (key) {
      case 'health':
        setShowHealthCapture(true)
        break
      case 'facilities':
        switchTab('facilities')
        break
      case 'missing':
      case 'blood':
        switchTab('emergency')
        break
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="pl-device">
        <div className="pl-screen">
          {showQR && <QRModal onClose={() => setShowQR(false)} petName={petName} petPhoto={petPhoto} guardianName={guardianName} />}
          {showCamera && <PetPhotoCapture onClose={() => setShowCamera(false)} onRegister={handleRegister} />}
          {showHealthCapture && <HealthDocCapture onClose={() => setShowHealthCapture(false)} onRegister={handleHealthRecordAdd} />}
          {govIdModal && <GovIdModal guardian={govIdModal} onClose={() => setGovIdModal(null)} />}
          {healthRecord !== null && <HealthRecordModal id={healthRecord} records={healthRecords} onClose={() => setHealthRecord(null)} />}
          {mapPopup && <MapPopupModal location={mapPopup} onClose={() => setMapPopup(null)} />}
          {showEditProfile && (
            <EditProfileModal
              guardianName={guardianName}
              petName={petName}
              bloodType={petBloodType}
              onClose={() => setShowEditProfile(false)}
              onSave={handleEditProfileSave}
            />
          )}
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
                petName={petName}
                guardianName={guardianName}
                onPhotoClick={() => setShowCamera(true)}
                onQRClick={() => setShowQR(true)}
                onViewAllClick={() => switchTab('health')}
                onQuickAction={handleQuickAction}
                onLogout={handleLogout}
              />
            </div>

            <div className={`pl-page${activeTab === 'wallet' ? ' active' : ''}`}>
              <WalletTab
                petName={petName}
                petPhoto={petPhoto}
                petBloodType={petBloodType}
                guardianName={guardianName}
                onQRClick={() => setShowQR(true)}
                onSelectRecord={id => setHealthRecord(id)}
                onSelectGuardian={g => setGovIdModal(g)}
                onEditProfile={() => setShowEditProfile(true)}
              />
            </div>

            <div className={`pl-page${activeTab === 'health' ? ' active' : ''}`}>
              <HealthTab
                records={healthRecords}
                onOpenCamera={() => setShowHealthCapture(true)}
                onSelectRecord={id => setHealthRecord(id)}
              />
            </div>

            <div className={`pl-page${activeTab === 'facilities' ? ' active' : ''}`}>
              <FacilitiesTab />
            </div>

            <div className={`pl-page${activeTab === 'emergency' ? ' active' : ''}`}>
              <EmergencyTab
                petName={petName}
                petPhoto={petPhoto}
                petBreed={petBreed}
                petBloodType={petBloodType}
                onOpenMap={loc => setMapPopup(loc)}
              />
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
