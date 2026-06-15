import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
import {uploadImageToCloudinary, getImagePreviewUri} from '../../config/cloudinaryConfig';
import {showImagePickerAlert} from '../../utils/imagePicker';
import selfie from '../../assets/selfiepicture.png';

const PALETTE = {
  primary: '#059669',
  primaryDark: '#047857',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  bg: '#f8fafc',
};

const formatDate = date =>
  date
    ? date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

const toDisplayUri = getImagePreviewUri;

const BasicInfoScreen = ({route, navigation}) => {
  const {setData} = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [pickerDate, setPickerDate] = useState(new Date(2000, 0, 1));
  const [imageUri, setImageUri] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const openDatePicker = () => {
    setPickerDate(dateOfBirth || new Date(2000, 0, 1));
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    setDateOfBirth(pickerDate);
    setShowDatePicker(false);
    setErrors(prev => ({...prev, dateOfBirth: undefined}));
  };

  const handleAndroidDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDateOfBirth(selectedDate);
      setErrors(prev => ({...prev, dateOfBirth: undefined}));
    }
  };

  const pickGender = () => {
    Alert.alert('Gender', 'Select your gender', [
      {text: 'Male', onPress: () => setGender('male')},
      {text: 'Female', onPress: () => setGender('female')},
      {text: 'Other', onPress: () => setGender('other')},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const validateFields = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    if (phoneNumber.length !== 11 || !/^\d{11}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 11 digits';
    }
    if (!gender) newErrors.gender = 'Gender is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    setIsLoading(true);
    try {
      let uploadedImageUrl = null;
      if (imageUri) {
        uploadedImageUrl = await uploadImageToCloudinary(imageUri);
        if (!uploadedImageUrl) {
          Alert.alert('Upload failed', 'Could not upload photo to Cloudinary.');
          return;
        }
      }

      setData('basicInfo', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber,
        gender,
        address: address.trim(),
        dateOfBirth: formatDate(dateOfBirth),
        imageUri: uploadedImageUrl,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickOrCaptureImage = () => {
    showImagePickerAlert({
      onImageSelected: asset => {
        setImageUri(asset);
        setErrors(prev => ({...prev, imageUri: undefined}));
      },
      cropping: Platform.OS === 'ios',
      width: 800,
      height: 800,
    });
  };

  const genderLabel =
    gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Feather name="user" size={22} color={PALETTE.primary} />
          <Text style={styles.title}>Basic Information</Text>
        </View>

        <View style={styles.imageContainer}>
          <View style={styles.imageFrame}>
            <Image
              source={
                imageUri ? {uri: toDisplayUri(imageUri)} : selfie
              }
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </View>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickOrCaptureImage}
            activeOpacity={0.85}>
            <MaterialCommunityIcons name="camera" size={18} color="#fff" />
            <Text style={styles.imageButtonText}>
              {imageUri ? 'Change photo' : 'Upload picture (optional)'}
            </Text>
          </TouchableOpacity>
        </View>

        <Field
          icon="user"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
        />
        <Field
          icon="user"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          error={errors.lastName}
        />

        <Pressable style={styles.inputGroup} onPress={pickGender}>
          <MaterialCommunityIcons
            name="gender-male-female"
            size={18}
            color={PALETTE.muted}
            style={styles.inputIcon}
          />
          <Text style={styles.fieldValue}>{genderLabel}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={PALETTE.muted}
          />
        </Pressable>
        {errors.gender ? (
          <Text style={styles.errorText}>{errors.gender}</Text>
        ) : null}

        <Field
          icon="phone"
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          maxLength={11}
          error={errors.phoneNumber}
        />

        <Pressable style={styles.inputGroup} onPress={openDatePicker}>
          <Feather
            name="calendar"
            size={18}
            color={PALETTE.muted}
            style={styles.inputIcon}
          />
          <Text
            style={[
              styles.fieldValue,
              !dateOfBirth && styles.placeholderText,
            ]}>
            {dateOfBirth ? formatDate(dateOfBirth) : 'Select date of birth'}
          </Text>
        </Pressable>
        {errors.dateOfBirth ? (
          <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
        ) : null}

        <Field
          icon="mail"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <Field
          icon="map-pin"
          placeholder="Home Address"
          value={address}
          onChangeText={setAddress}
          error={errors.address}
        />

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.9}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.iosPickerSheet}>
            <View style={styles.pickerToolbar}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.toolbarBtn}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.toolbarTitle}>Date of birth</Text>
              <TouchableOpacity onPress={confirmDate}>
                <Text style={[styles.toolbarBtn, styles.toolbarDone]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => date && setPickerDate(date)}
              maximumDate={new Date()}
              themeVariant="light"
              style={styles.iosPicker}
            />
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={handleAndroidDateChange}
            maximumDate={new Date()}
          />
        )
      )}
    </KeyboardAvoidingView>
  );
};

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  autoCapitalize,
  error,
}) {
  return (
    <>
      <View style={styles.inputGroup}>
        <Feather
          name={icon}
          size={18}
          color={PALETTE.muted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? 'words'}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 10,
    color: PALETTE.primaryDark,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#d1fae5',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: PALETTE.primary,
    borderRadius: 24,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderColor: PALETTE.border,
    borderWidth: 1,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: PALETTE.text,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
    color: PALETTE.text,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  inputIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  saveButton: {
    backgroundColor: PALETTE.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  iosPickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
  },
  pickerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.border,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.text,
  },
  toolbarBtn: {
    fontSize: 16,
    color: PALETTE.muted,
    padding: 4,
  },
  toolbarDone: {
    color: PALETTE.primary,
    fontWeight: '700',
  },
  iosPicker: {
    height: 220,
  },
});

export default BasicInfoScreen;
