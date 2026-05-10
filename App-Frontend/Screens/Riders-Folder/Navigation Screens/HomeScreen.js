import React, {useMemo, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DEFAULT_CENTER = {lat: 33.6844, lng: 73.0479};

async function fetchOsrmRoute(pickup, dropoff) {
  const url = `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Route request failed');
  const json = await res.json();
  if (!json.routes?.[0]?.geometry?.coordinates) return [];
  return json.routes[0].geometry.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

function buildLeafletHtml({pickup, dropoff, routeCoords}) {
  const cfg = {
    center: pickup?.latitude != null
      ? {lat: pickup.latitude, lng: pickup.longitude}
      : DEFAULT_CENTER,
    pickup:
      pickup?.latitude != null
        ? {lat: pickup.latitude, lng: pickup.longitude}
        : null,
    dropoff:
      dropoff?.latitude != null
        ? {lat: dropoff.latitude, lng: dropoff.longitude}
        : null,
    line:
      routeCoords.length > 1
        ? routeCoords.map(c => [c.latitude, c.longitude])
        : [],
  };

  const cfgJson = JSON.stringify(cfg).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var CFG = ${cfgJson};
    var map = L.map('map').setView([CFG.center.lat, CFG.center.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var bounds = [];
    if (CFG.pickup) {
      L.circleMarker([CFG.pickup.lat, CFG.pickup.lng], {
        radius: 10, color: '#059669', fillColor: '#34d399', fillOpacity: 0.9
      }).addTo(map).bindTooltip('Pickup', {permanent: false});
      bounds.push([CFG.pickup.lat, CFG.pickup.lng]);
    }
    if (CFG.dropoff) {
      L.circleMarker([CFG.dropoff.lat, CFG.dropoff.lng], {
        radius: 10, color: '#dc2626', fillColor: '#fca5a5', fillOpacity: 0.9
      }).addTo(map).bindTooltip('Drop-off', {permanent: false});
      bounds.push([CFG.dropoff.lat, CFG.dropoff.lng]);
    }
    if (CFG.line && CFG.line.length > 1) {
      var pl = L.polyline(CFG.line, { color: '#059669', weight: 5, opacity: 0.9 }).addTo(map);
      map.fitBounds(pl.getBounds().pad(0.15));
    } else if (bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  </script>
</body>
</html>`;
}

const HomeScreen = () => {
  const route = useRoute();
  const {pickup, dropoff} = route.params || {};
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (pickup?.latitude != null && dropoff?.latitude != null) {
      setRouteLoading(true);
      fetchOsrmRoute(pickup, dropoff)
        .then(coords => {
          if (!cancelled) setRouteCoords(coords);
        })
        .catch(() => {
          if (!cancelled) setRouteCoords([]);
        })
        .finally(() => {
          if (!cancelled) setRouteLoading(false);
        });
    } else {
      setRouteCoords([]);
    }
    return () => {
      cancelled = true;
    };
  }, [pickup, dropoff]);

  const mapHtml = useMemo(
    () => buildLeafletHtml({pickup, dropoff, routeCoords}),
    [pickup, dropoff, routeCoords],
  );

  const shareLocationOnWhatsApp = () => {
    if (!pickup || !dropoff) {
      Alert.alert(
        'No route',
        'Pick pickup and dropoff from booking flow first, then share.',
      );
      return;
    }
    const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}`;
    const message = `Ride — Share Go\n${mapsLink}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', 'Could not open WhatsApp.');
    });
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{html: mapHtml}}
        style={StyleSheet.absoluteFillObject}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
      />

      {routeLoading ? (
        <View style={styles.routeBadge}>
          <ActivityIndicator color="#059669" size="small" />
          <Text style={styles.routeBadgeText}>Drawing route…</Text>
        </View>
      ) : null}

      <View style={styles.bottomPanel}>
        <TouchableOpacity
          style={styles.waBtn}
          onPress={shareLocationOnWhatsApp}
          activeOpacity={0.9}>
          <Icon name="whatsapp" size={22} color="#fff" />
          <Text style={styles.waBtnText}>Share on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  routeBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  routeBadgeText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  bottomPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 28 : 16,
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#166534',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  waBtnText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;
