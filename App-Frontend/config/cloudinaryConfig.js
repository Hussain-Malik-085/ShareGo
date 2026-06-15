import {Alert} from 'react-native';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  API_BASE_URL,
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

const fileNameFromUri = uri => {
  const base = (uri || '').split('/').pop()?.split('?')[0] || '';
  if (base && base.includes('.')) return base;
  const ext = mimeFromUri(uri) === 'image/png' ? 'png' : 'jpg';
  return `sharego_${Date.now()}.${ext}`;
};

/** Normalize local paths for React Native FormData uploads. */
export const normalizeFileUri = input => {
  const uri = typeof input === 'string' ? input : input?.path;
  if (!uri) return uri;
  if (uri.startsWith('content://')) return uri;
  if (uri.startsWith('ph://') || uri.startsWith('assets-library://')) {
    return uri;
  }
  if (uri.startsWith('file://')) return uri;
  if (uri.startsWith('/')) {
    return `file://${uri}`;
  }
  return uri;
};

export const getImagePreviewUri = input =>
  input ? normalizeFileUri(input) : null;

function parseAsset(input) {
  if (!input) return null;
  if (typeof input === 'string') {
    return {path: input, base64: null, mime: mimeFromUri(input)};
  }
  return {
    path: input.path,
    base64: input.base64 || null,
    mime: input.mime || mimeFromUri(input.path),
  };
}

function uploadWithXHR(endpoint, formData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(
            new Error(data?.error?.message || `Upload failed (${xhr.status})`),
          );
        }
      } catch {
        reject(new Error('Invalid response from Cloudinary'));
      }
    };
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.open('POST', endpoint);
    xhr.timeout = 120000;
    xhr.send(formData);
  });
}

async function uploadViaBackend(asset) {
  if (!API_BASE_URL?.trim() || !asset.base64) {
    return null;
  }
  const base = API_BASE_URL.trim().replace(/\/$/, '');
  const response = await fetch(`${base}/upload/image`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      base64: asset.base64,
      mime: asset.mime,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Backend upload failed (${response.status})`);
  }
  return data.secure_url || data.url || null;
}

async function uploadDirectToCloudinary(asset) {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary not configured in .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET)',
    );
  }

  const formData = new FormData();
  const preset = CLOUDINARY_UPLOAD_PRESET.trim();
  const cloud = CLOUDINARY_CLOUD_NAME.trim();

  if (asset.base64) {
    formData.append('file', `data:${asset.mime};base64,${asset.base64}`);
  } else {
    const normalizedUri = normalizeFileUri(asset.path);
    if (
      normalizedUri.startsWith('ph://') ||
      normalizedUri.startsWith('assets-library://')
    ) {
      throw new Error('Pick the photo again from gallery.');
    }
    formData.append('file', {
      uri: normalizedUri,
      type: asset.mime,
      name: fileNameFromUri(normalizedUri),
    });
  }

  formData.append('upload_preset', preset);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
  const data = await uploadWithXHR(endpoint, formData);
  return data.secure_url || data.url || null;
}

export const uploadImageToCloudinary = async input => {
  const asset = parseAsset(input);
  if (!asset?.path && !asset?.base64) {
    return null;
  }

  try {
    return await uploadDirectToCloudinary(asset);
  } catch (directError) {
    console.warn('Direct Cloudinary upload failed:', directError?.message);
    try {
      const viaBackend = await uploadViaBackend(asset);
      if (viaBackend) return viaBackend;
    } catch (backendError) {
      console.warn('Backend upload failed:', backendError?.message);
    }

    Alert.alert(
      'Upload failed',
      directError?.message ||
        'Could not upload image. Check internet and Cloudinary preset "sharego_uploads" (Unsigned).',
    );
    return null;
  }
};

export const uploadImagesToCloudinary = async inputs => {
  const results = [];
  for (const input of inputs) {
    results.push(await uploadImageToCloudinary(input));
  }
  return results;
};
