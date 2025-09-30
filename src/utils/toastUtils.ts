import Toast from 'react-native-toast-message';

export const showSuccessToast = (message = 'Success!', title = 'Success') => {
    Toast.show({
        type: 'success',
        text1: title,
        text2: message,
        position: 'bottom',
        visibilityTime: 3000,
    });
};

export const showErrorToast = (message = 'Something went wrong', title = 'Error') => {
    Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        position: 'bottom',
        visibilityTime: 3000,
    });
};