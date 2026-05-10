import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../config/config';

/**
 * If MongoDB already has a rider profile for this Supabase email, open rider home.
 */
export async function tryNavigateExistingRider(loginEmail, navigation) {
  const normalized = String(loginEmail || '').trim().toLowerCase();
  if (!normalized) return false;
  try {
    const url = `${BASE_URL}/riders/lookup?email=${encodeURIComponent(normalized)}`;
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    const rid = data?.rider?._id;
    if (!rid) return false;
    await AsyncStorage.multiSet([
      ['riderId', String(rid)],
      ['userRole', 'Rider'],
      ['riderProfileComplete', 'true'],
    ]);
    navigation.replace('Rider_HomeScreen');
    return true;
  } catch {
    return false;
  }
}
