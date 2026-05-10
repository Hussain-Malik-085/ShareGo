/**
 * Server-side fare estimation: geocode → route distance → fare breakdown.
 * Avoids exposing third-party keys in the mobile app (ORS 401 from the device was breaking Fare).
 */

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

async function geocode(place) {
  const query = `${String(place).trim()}, Lahore, Pakistan`;
  const ocKey = process.env.OPENCAGE_API_KEY;
  if (ocKey && ocKey.trim()) {
    const url = new URL('https://api.opencagedata.com/geocode/v1/json');
    url.searchParams.set('q', query);
    url.searchParams.set('key', ocKey.trim());
    url.searchParams.set('countrycode', 'pk');
    url.searchParams.set('limit', '1');
    const r = await fetch(url.toString(), {signal: AbortSignal.timeout(15000)});
    const data = await r.json().catch(() => ({}));
    if (data?.results?.length) {
      const {lat, lng} = data.results[0].geometry;
      return {latitude: lat, longitude: lng};
    }
  }

  const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const r2 = await fetch(nomUrl, {
    headers: {'User-Agent': 'ShareGoUniversityProject/1.0 (contact: student-project)'},
    signal: AbortSignal.timeout(20000),
  });
  const arr = await r2.json().catch(() => []);
  if (!Array.isArray(arr) || !arr.length) {
    throw new Error(
      `Could not locate "${place}". Try a clearer place name (e.g. area + landmark).`,
    );
  }
  return {latitude: parseFloat(arr[0].lat), longitude: parseFloat(arr[0].lon)};
}

/** ORS accepts either raw API key or Bearer + JWT depending on key type. */
function openRouteServiceAuthHeaders(key) {
  const k = String(key || '').trim();
  if (!k) return [];
  if (k.startsWith('eyJ')) {
    return [{Authorization: `Bearer ${k}`}, {Authorization: k}];
  }
  return [{Authorization: k}, {Authorization: `Bearer ${k}`}];
}

async function drivingDistanceKm(start, end, vehicleType) {
  const key = (process.env.OPENROUTESERVICE_API_KEY || '').trim();
  const profile =
    String(vehicleType || 'car').toLowerCase() === 'bike'
      ? 'cycling-regular'
      : 'driving-car';

  if (key) {
    const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
    const body = JSON.stringify({
      coordinates: [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ],
    });
    for (const authHeader of openRouteServiceAuthHeaders(key)) {
      try {
        const orsRes = await fetch(url, {
          method: 'POST',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
            Accept: 'application/geo+json, application/json',
          },
          body,
          signal: AbortSignal.timeout(25000),
        });
        if (orsRes.ok) {
          const data = await orsRes.json().catch(() => ({}));
          const props = data?.features?.[0]?.properties;
          const meters =
            props?.segments?.[0]?.distance ??
            props?.summary?.distance ??
            null;
          if (typeof meters === 'number' && meters > 0) {
            return meters / 1000;
          }
        } else if (orsRes.status === 401 || orsRes.status === 403) {
          continue;
        }
      } catch (e) {
        console.warn('[fare-estimate] OpenRouteService attempt failed:', e.message);
      }
    }
  }

  const straight = haversineKm(start, end);
  const ROAD_FACTOR = Number(process.env.FARE_ROAD_FACTOR) || 1.35;
  return straight * ROAD_FACTOR;
}

function parseFuelPricePerLiter() {
  const direct = process.env.PETROL_PRICE_PKR_PER_LITER;
  if (direct != null && String(direct).trim() !== '') {
    const n = parseFloat(String(direct));
    if (Number.isFinite(n) && n > 0) return n;
  }
  const display = process.env.PETROL_PRICE_DISPLAY || 'Rs. 280/Ltr';
  const n = parseFloat(String(display).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 280;
}

function computeFareParts(km, vehicleType, fuelPricePerLiter) {
  const Bike_BASE_FARE = 50;
  const Car_BASE_FARE = 100;
  const VEHICLE_CONSUMPTION = {bike: 40, car: 13};
  const SHAREGO_PERCENTAGE = {bike: 0.1, car: 0.1};
  const vt =
    String(vehicleType || 'car').toLowerCase() === 'bike' ? 'bike' : 'car';
  const BASE_FARE = vt === 'bike' ? Bike_BASE_FARE : Car_BASE_FARE;
  const fuelNeeded = km / VEHICLE_CONSUMPTION[vt];
  const fuelCost = fuelNeeded * fuelPricePerLiter;
  const subtotal = BASE_FARE + fuelCost;
  const sharegoEarning = subtotal * SHAREGO_PERCENTAGE[vt];
  const totalFare = Math.round(subtotal + sharegoEarning);

  return {
    vehicleType: vt,
    baseFare: BASE_FARE,
    fuelLiters: Math.round(fuelNeeded * 1000) / 1000,
    fuelCost: Math.round(fuelCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    sharegoCommission: Math.round(sharegoEarning * 100) / 100,
    totalFare,
    distanceKm: Math.round(km * 100) / 100,
  };
}

async function estimateFareFromAddresses({pickup, destination, vehicleType}) {
  const [pickupCoords, destCoords] = await Promise.all([
    geocode(pickup),
    geocode(destination),
  ]);
  const km = await drivingDistanceKm(pickupCoords, destCoords, vehicleType);
  const fuelPricePerLiter = parseFuelPricePerLiter();
  const fareParts = computeFareParts(km, vehicleType, fuelPricePerLiter);
  return {
    pickupCoords,
    destCoords,
    fuelPricePerLiter,
    distanceMethod:
      (process.env.OPENROUTESERVICE_API_KEY || '').trim()
        ? 'openrouteservice'
        : 'straight_line_adjusted',
    ...fareParts,
  };
}

module.exports = {
  estimateFareFromAddresses,
  computeFareParts,
  parseFuelPricePerLiter,
};
