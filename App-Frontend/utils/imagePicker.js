import {Alert, Linking, Platform, PermissionsAndroid} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const PICKER_OPTS = {
  mediaType: 'photo',
  compressImageQuality: 0.8,
  includeBase64: true,
  forceJpg: true,
};

export function toImageAsset(image) {
  if (!image?.path) {
    return null;
  }
  return {
    path: image.path,
    base64: image.data || null,
    mime: image.mime || 'image/jpeg',
  };
}

async function ensureAndroidGalleryPermission() {
  if (Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function ensureAndroidCameraPermission() {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function isPickerCancelled(error) {
  return (
    error?.code === 'E_PICKER_CANCELLED' ||
    error?.code === 'E_NO_CAMERA_PERMISSION' ||
    error?.code === 'E_NO_LIBRARY_PERMISSION' ||
    error?.message?.toLowerCase?.().includes('cancel')
  );
}

function isPermissionError(error) {
  const code = error?.code || '';
  return (
    code === 'E_NO_CAMERA_PERMISSION' ||
    code === 'E_NO_LIBRARY_PERMISSION' ||
    error?.message?.toLowerCase?.().includes('permission')
  );
}

function showPermissionAlert(kind) {
  Alert.alert(
    `${kind} permission`,
    `Allow ${kind.toLowerCase()} access in Settings to continue.`,
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Open Settings', onPress: () => Linking.openSettings()},
    ],
  );
}

async function openGalleryPicker({width, height, cropping}) {
  if (Platform.OS === 'android') {
    const allowed = await ensureAndroidGalleryPermission();
    if (!allowed) {
      showPermissionAlert('Photos');
      return null;
    }
  }

  try {
    return await ImagePicker.openPicker({
      ...PICKER_OPTS,
      width,
      height,
      cropping,
    });
  } catch (error) {
    if (isPickerCancelled(error)) return null;
    if (isPermissionError(error)) {
      showPermissionAlert('Photos');
      return null;
    }
    Alert.alert(
      'Gallery error',
      'Could not open your photo library. Try again or use Take Photo.',
    );
    return null;
  }
}

async function openCameraPicker({width, height, cropping}) {
  if (Platform.OS === 'android') {
    const allowed = await ensureAndroidCameraPermission();
    if (!allowed) {
      showPermissionAlert('Camera');
      return null;
    }
  }

  try {
    return await ImagePicker.openCamera({
      ...PICKER_OPTS,
      width,
      height,
      cropping,
    });
  } catch (error) {
    if (isPickerCancelled(error)) return null;
    if (isPermissionError(error)) {
      showPermissionAlert('Camera');
      return null;
    }
    Alert.alert('Camera error', 'Could not open the camera.');
    return null;
  }
}

function runAfterAlertDismiss(fn) {
  const delay = Platform.OS === 'ios' ? 450 : 0;
  setTimeout(fn, delay);
}

/** Calls onImageSelected({ path, base64, mime }) */
export function showImagePickerAlert({
  onImageSelected,
  cropping = true,
  width = 800,
  height = 800,
} = {}) {
  const options = {width, height, cropping};

  Alert.alert('Add photo', 'Choose how you want to add the image', [
    {
      text: 'Choose from Gallery',
      onPress: () => {
        runAfterAlertDismiss(async () => {
          const image = await openGalleryPicker(options);
          const asset = toImageAsset(image);
          if (asset) onImageSelected?.(asset);
        });
      },
    },
    {
      text: 'Take Photo',
      onPress: () => {
        runAfterAlertDismiss(async () => {
          const image = await openCameraPicker(options);
          const asset = toImageAsset(image);
          if (asset) onImageSelected?.(asset);
        });
      },
    },
    {text: 'Cancel', style: 'cancel'},
  ]);
}
