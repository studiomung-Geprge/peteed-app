import { supabase } from './supabase'

export interface MyPet {
  id: string
  name: string
  breed: string | null
  photo_url: string | null
}

function randomRegistrationNumber() {
  const suffix = Math.floor(1000000 + Math.random() * 8999999)
  return `41000-${suffix}`
}

// The prototype's UI is built around a single pet profile per guardian. On
// first login for a given Supabase user, App.tsx checks getMyPet() — if it
// returns null, the user hasn't provided their guardian/pet name yet, so we
// show an onboarding screen. Submitting it calls createMyPet() with the real
// name instead of a hardcoded placeholder. On every later login, getMyPet()
// just looks the existing row up.
export async function getMyPet(userId: string): Promise<MyPet | null> {
  if (!supabase) return null

  const { data: existing, error: fetchErr } = await supabase
    .from('pet_guardians')
    .select('pets ( id, name, breed, photo_url )')
    .eq('profile_id', userId)
    .limit(1)
    .maybeSingle()

  if (fetchErr) throw fetchErr
  if (existing && (existing as any).pets) return (existing as any).pets as MyPet
  return null
}

export async function createMyPet(userId: string, name: string): Promise<MyPet> {
  if (!supabase) throw new Error('Supabase is not configured in this environment')

  const { data: pet, error: petErr } = await supabase
    .from('pets')
    .insert({
      name,
      breed: '사모예드',
      breed_en: 'Samoyed',
      gender: 'male_neutered',
      birth_date: '2022-05-06',
      registration_number: randomRegistrationNumber(),
      photo_url: 'https://images.unsplash.com/photo-1736196674354-b5e918a64644?w=400&h=400&fit=crop&crop=face',
    })
    .select('id, name, breed, photo_url')
    .single()
  if (petErr) throw petErr

  const { error: linkErr } = await supabase
    .from('pet_guardians')
    .insert({ pet_id: pet.id, profile_id: userId, role: 'primary' })
  if (linkErr) throw linkErr

  return pet as MyPet
}

export async function getGuardianName(userId: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle()
  if (error) throw error
  return data?.full_name ?? null
}

export async function updateGuardianName(userId: string, fullName: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
  if (error) throw error
}

export async function updatePetName(petId: string, name: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('pets').update({ name }).eq('id', petId)
  if (error) throw error
}

export interface PersonalInfo {
  fullName: string | null
  phone: string | null
  address: string | null
}

// My Page's "개인 회원 정보 수정" panel — same `profiles` row as
// getGuardianName/updateGuardianName, plus the optional phone/address
// columns added for that panel (see the add_profile_phone_and_address
// migration).
export async function getPersonalInfo(userId: string): Promise<PersonalInfo> {
  if (!supabase) return { fullName: null, phone: null, address: null }
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone, address')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return {
    fullName: data?.full_name ?? null,
    phone: data?.phone ?? null,
    address: data?.address ?? null,
  }
}

export async function updatePersonalInfo(userId: string, info: { fullName: string; phone: string; address: string }): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: info.fullName,
      phone: info.phone || null,
      address: info.address || null,
    })
    .eq('id', userId)
  if (error) throw error
}

export interface FacilityRow {
  id: string
  name: string
  region: string | null
  category: string | null
  status: string
  description: string | null
  website_url: string | null
  is_bookable: boolean
}

export async function fetchFacilities(): Promise<FacilityRow[]> {
  if (!supabase) throw new Error('Supabase is not configured in this environment')
  const { data, error } = await supabase.from('facilities').select('*').order('name')
  if (error) throw error
  return data ?? []
}
