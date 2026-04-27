import axios from 'axios';
import {Alert} from 'react-native';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_API_KEY,
} from '@env';

export const uploadImageToCloudinary = async uri => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.warn(
      'ShareGo: Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in .env (see .env.example).',
    );
    Alert.alert(
      'Config',
      'Cloudinary is not configured. Add cloud name and upload preset in .env file.',
    );
    return null;
  }

  const formData = new FormData();
  const file = {
    uri: uri.startsWith('content://') ? uri.replace('content://', 'file://') : uri,
    type: 'image/jpeg',
    name: 'image.jpg',
  };
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  if (CLOUDINARY_API_KEY) {
    formData.append('api_key', CLOUDINARY_API_KEY);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await axios.post(endpoint, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error.response || error.message);
    Alert.alert('Error', 'Failed to upload image to Cloudinary.');
    return null;
  }
};
