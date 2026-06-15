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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {uploadImageToCloudinary, getImagePreviewUri} from '../../config/cloudinaryConfig';
import {showImagePickerAlert} from '../../utils/imagePicker';
import front_cover from '../../assets/Liencefront.png';
import back_cover from '../../assets/Lienceback.png';

const LicenseScreen = ({route, navigation}) => {
  const {setData, markSectionCompleted} = route.params;
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
  
    try {
      if (
        !licenseNumber ||
        !issueDate ||
        !expiryDate ||
        !frontImage ||
        !backImage
      ) {
        Alert.alert('All fields are required.');
        return;
      }
  
      const frontImageUrl = await uploadImageToCloudinary(frontImage);
      const backImageUrl = await uploadImageToCloudinary(backImage);
  
      if (frontImageUrl && backImageUrl) {
        const data = {
          licenseNumber,
          issueDate,
          expiryDate,
          frontImage: frontImageUrl,
          backImage: backImageUrl,
        };
  
        setData('license', data);
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to upload images. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickOrCaptureImage = side => {
    showImagePickerAlert({
      cropping: false,
      onImageSelected: asset => {
        if (side === 'front') setFrontImage(asset);
        else setBackImage(asset);
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>License Information</Text>
        <TextInput
          style={styles.input}
          placeholder="0912200/L"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />
        
        {/* Issue Date Picker */}
        <Text style={styles.dateLabel}>Issue Date:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowIssueDatePicker(true)}>
          <Text style={styles.dateButtonText}>
            {issueDate ? issueDate.toLocaleDateString() : 'Select Issue Date'}
          </Text>
        </TouchableOpacity>

        {showIssueDatePicker && (
          <DateTimePicker
            value={issueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowIssueDatePicker(false); 
              if (selectedDate) {
                setIssueDate(selectedDate); 
              }
            }}
          />
        )}

        {/* Expiry Date Picker */}
        <Text style={styles.dateLabel}>Expiry Date:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowExpiryDatePicker(true)}>
          <Text style={styles.dateButtonText}>
            {expiryDate
              ? expiryDate.toLocaleDateString()
              : 'Select Expiry Date'}
          </Text>
        </TouchableOpacity>

        {showExpiryDatePicker && (
          <DateTimePicker
            value={expiryDate || new Date()} 
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowExpiryDatePicker(false);
              if (selectedDate) {
                setExpiryDate(selectedDate);
              }
            }}
          />
        )}

        {/* Front Image */}
        {!frontImage ? (
          <Image
            source={front_cover}
            style={styles.imagePreview}
          />
        ) : (
          <Image source={{uri: getImagePreviewUri(frontImage)}} style={styles.imagePreview} />
        )}

        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickOrCaptureImage('front')}>
          <Text style={styles.imageButtonText}>Front License</Text>
        </TouchableOpacity>

        {/* Back Image */}
        {!backImage ? (
          <Image
            source={back_cover}
            style={styles.imagePreview}
          />
        ) : (
          <Image source={{uri: getImagePreviewUri(backImage)}} style={styles.imagePreview} />
        )}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickOrCaptureImage('back')}>
          <Text style={styles.imageButtonText}>Back License</Text>
        </TouchableOpacity>

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
  container: {flex: 1, backgroundColor: '#f2f2f2', padding: 20},
  scrollContainer: {paddingBottom: 20},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  dateLabel: {fontSize: 16, marginBottom: 5},
  dateButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {color: '#333', fontSize: 16},
  imagePreview: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  imageButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageButtonText: {color: '#fff', fontSize: 16},
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});

export default LicenseScreen;
