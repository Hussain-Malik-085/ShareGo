import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {uploadImageToCloudinary} from '../../config/cloudinaryConfig';
import frontCover from '../../assets/frontside.png';

const CNICScreen = ({route, navigation}) => {
  const {setData} = route.params;
  const [cnicNumber, setCnicNumber] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const pickOrCaptureImage = async side => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      return;
    }

    Alert.alert('Select an option', 'Choose how to add the image', [
      {
        text: 'Take Photo',
        onPress: () => {
          ImagePicker.openCamera({mediaType: 'photo'}).then(image => {
            if (side === 'front') setFrontImage(image.path);
            else setBackImage(image.path);
          });
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          ImagePicker.openPicker({mediaType: 'photo'}).then(image => {
            if (side === 'front') setFrontImage(image.path);
            else setBackImage(image.path);
          });
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (cnicNumber.length !== 13) {
      setErrorMessage('Please enter a valid 13-digit CNIC number.');
      return;
    }

    if (!frontImage || !backImage) {
      Alert.alert('Required', 'Please upload both front and back CNIC images.');
      return;
    }

    setIsLoading(true);
    try {
      const frontImageUrl = await uploadImageToCloudinary(frontImage);
      const backImageUrl = await uploadImageToCloudinary(backImage);

      if (frontImageUrl && backImageUrl) {
        setData('cnic', {
          cnicNumber,
          frontImage: frontImageUrl,
          backImage: backImageUrl,
        });
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to upload CNIC images. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>CNIC Information</Text>

        {!frontImage ? (
          <Image source={frontCover} style={styles.imagePreview} />
        ) : (
          <Image source={{uri: frontImage}} style={styles.imagePreview} />
        )}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickOrCaptureImage('front')}>
          <Text style={styles.imageButtonText}>Front CNIC</Text>
        </TouchableOpacity>

        {!backImage ? (
          <Image source={frontCover} style={styles.imagePreview} />
        ) : (
          <Image source={{uri: backImage}} style={styles.imagePreview} />
        )}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickOrCaptureImage('back')}>
          <Text style={styles.imageButtonText}>Back CNIC</Text>
        </TouchableOpacity>

        <Text style={styles.title}>CNIC Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CNIC number without dashes."
          value={cnicNumber}
          onChangeText={setCnicNumber}
          keyboardType="numeric"
          maxLength={13}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={isLoading ? null : handleSave}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f4f4f9', padding: 20},
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {fontSize: 26, fontWeight: 'bold', marginBottom: 25, color: '#333'},
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 25,
    paddingLeft: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  errorText: {color: 'red', fontSize: 14, marginBottom: 10},
  imageButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 25,
  },
  disabledButton: {backgroundColor: '#A5D6A7'},
  saveButtonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default CNICScreen;
