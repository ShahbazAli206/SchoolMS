import {Alert} from 'react-native';

export const getErrorMessage = error => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
};

export const handleApiError = (error, showAlert = true) => {
  const message = getErrorMessage(error);
  const statusCode = error?.response?.status;

  if (showAlert) {
    const title = statusCode ? `Error (${statusCode})` : 'Error';
    Alert.alert(title, message, [{text: 'OK'}]);
  }

  return {message, statusCode};
};

export const networkError = () =>
  Alert.alert('No Connection', 'Please check your internet connection and try again.', [{text: 'OK'}]);
