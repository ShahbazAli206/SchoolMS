import {Linking, Platform, Alert} from 'react-native';

export const shareToWhatsApp = async (message, phoneNumber = null) => {
  try {
    let url = '';

    if (Platform.OS === 'android') {
      // Android WhatsApp URL scheme
      url = phoneNumber
        ? `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
        : `whatsapp://send?text=${encodeURIComponent(message)}`;
    } else {
      // iOS WhatsApp URL scheme
      url = phoneNumber
        ? `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
        : `whatsapp://send?text=${encodeURIComponent(message)}`;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to WhatsApp web or show error
      Alert.alert(
        'WhatsApp Not Found',
        'Please install WhatsApp to share content',
        [
          {text: 'OK'},
          {
            text: 'Install WhatsApp',
            onPress: () => {
              const storeUrl = Platform.OS === 'android'
                ? 'market://details?id=com.whatsapp'
                : 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
              Linking.openURL(storeUrl);
            }
          }
        ]
      );
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open WhatsApp');
  }
};

export const shareAssignmentToWhatsApp = (assignment) => {
  const message = `📚 Assignment: ${assignment.title}\n📅 Due: ${new Date(assignment.due_date).toLocaleDateString()}\n📝 Subject: ${assignment.subject_name}\n\nDownload the SchoolMS app for more details!`;
  shareToWhatsApp(message);
};

export const shareFeeToWhatsApp = (fee) => {
  const message = `💰 Fee Reminder: ${fee.title}\n💵 Amount: ₹${fee.amount}\n📅 Due Date: ${new Date(fee.due_date).toLocaleDateString()}\n\nPay via SchoolMS app!`;
  shareToWhatsApp(message);
};

export const shareMarkToWhatsApp = (mark, studentName) => {
  const message = `📊 ${studentName}'s Mark: ${mark.subject_name}\n🎯 Score: ${mark.obtained_marks}/${mark.total_marks}\n📈 Percentage: ${((mark.obtained_marks / mark.total_marks) * 100).toFixed(1)}%\n\nView full report in SchoolMS app!`;
  shareToWhatsApp(message);
};