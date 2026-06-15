import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../config/config';
import {supabase} from '../config/supabaseClient';

export async function getSignedInEmail() {
  try {
    const {
      data: {session},
    } = await supabase.auth.getSession();
    return session?.user?.email?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function lookupRiderIdByEmail(loginEmail) {
  const normalized = String(loginEmail || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  try {
    const url = `${BASE_URL}/riders/lookup?email=${encodeURIComponent(normalized)}`;
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const data = await res.json().catch(() => ({}));
    const rid = data?.rider?._id;
    return rid ? String(rid) : null;
  } catch {
    return null;
  }
}

export async function persistRiderSession(riderId) {
  await AsyncStorage.multiSet([
    ['riderId', String(riderId)],
    ['userRole', 'Rider'],
    ['riderProfileComplete', 'true'],
  ]);
}

/** Clear Supabase + local rider/driver session (explicit logout only). */
export async function logoutSession() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('logoutSession: signOut', error?.message);
  }

  await AsyncStorage.multiRemove([
    'riderId',
    'userRole',
    'riderProfileComplete',
    'driverId',
    'driverProfileComplete',
  ]);
}

async function hasLocalRiderSession() {
  const [riderId, complete, role] = await AsyncStorage.multiGet([
    'riderId',
    'riderProfileComplete',
    'userRole',
  ]);
  return (
    Boolean(riderId[1]) &&
    complete[1] === 'true' &&
    role[1] === 'Rider'
  );
}

/**
 * If MongoDB already has a rider profile for this email, open rider home.
 */
export async function tryNavigateExistingRider(loginEmail, navigation) {
  const rid = await lookupRiderIdByEmail(loginEmail);
  if (!rid) {
    return false;
  }
  await persistRiderSession(rid);
  navigation.replace('Rider_HomeScreen');
  return true;
}

/** Cold start: stay on dashboard until user logs out from drawer. */
export async function resolveInitialRoute() {
  const email = await getSignedInEmail();
  if (email) {
    const rid = await lookupRiderIdByEmail(email);
    if (rid) {
      await persistRiderSession(rid);
      return 'Rider_HomeScreen';
    }
    return 'RoleSelection';
  }

  if (await hasLocalRiderSession()) {
    return 'Rider_HomeScreen';
  }

  return 'Login';
}
