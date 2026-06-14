import {Alert, Platform} from 'react-native';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_API_KEY,
} from '@env';

export const isCloudinaryConfigured = () =>
  Boolean(
    CLOUDINARY_CLOUD_NAME?.trim() && CLOUDINARY_UPLOAD_PRESET?.trim(),
  );

const mimeFromUri = uri => {
  const lower = (uri || '').split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
};

const normalizeFileUri = uri => {
  if (!uri) return uri;
  if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
  if (uri.startsWith('/')) {
    return Platform.OS === 'android' ? uri : `file://${uri}`;
  }
  return uri;
};

export const uploadImageToCloudinary = async uri => {
  if (!isCloudinaryConfigured()) {
    console.warn(
      'ShareGo: Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in App-Frontend/.env (see .env.example).',
    );
    Alert.alert(
      'Cloudinary not configured',
      'Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to your .env file, then restart Metro (npm start -- --reset-cache).',
    );
    return null;
  }

  const normalizedUri = normalizeFileUri(uri);
  const formData = new FormData();
  formData.append('file', {
    uri: normalizedUri,
    type: mimeFromUri(normalizedUri),
    name: `upload_${Date.now()}.jpg`,
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET.trim());
  if (CLOUDINARY_API_KEY?.trim()) {
    formData.append('api_key', CLOUDINARY_API_KEY.trim());
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME.trim()}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload failed:', data);
      Alert.alert(
        'Upload failed',
        data?.error?.message || 'Cloudinary rejected the image. Check your upload preset is Unsigned.',
      );
      return null;
    }

    return data.secure_url || null;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    Alert.alert(
      'Upload failed',
      'Could not reach Cloudinary. Check your internet connection and .env settings.',
    );
    return null;
  }
};
