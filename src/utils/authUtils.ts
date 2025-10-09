import AsyncStorage from '@react-native-async-storage/async-storage';
import { showErrorToast } from './toastUtils';

/**
 * Utility functions for authentication management
 */

/**
 * Clear all authentication data from AsyncStorage
 */
export const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove(['@token', 'webtoken', '@user', 'userdetails']);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

/**
 * Check if a token is valid (not null, undefined, or empty string)
 */
export const isValidToken = (token: string | null | undefined): boolean => {
    try {
        if (!token || typeof token !== 'string') {
            return false;
        }
        return token !== 'null' && token !== 'undefined' && token.trim() !== '';
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

/**
 * Get stored tokens from AsyncStorage
 */
export const getStoredTokens = async (): Promise<{
    mobileToken: string | null;
    webToken: string | null;
}> => {
    try {
        const [mobileToken, webToken] = await AsyncStorage.multiGet(['@token', 'webtoken']);
        return {
            mobileToken: mobileToken[1],
            webToken: webToken[1],
        };
    } catch (error) {
        console.error('Error getting stored tokens:', error);
        return {
            mobileToken: null,
            webToken: null,
        };
    }
};

/**
 * Store tokens in AsyncStorage
 */
export const storeTokens = async (
    mobileToken?: string,
    webToken?: string
): Promise<void> => {
    try {
        const items: [string, string][] = [];

        if (mobileToken) {
            items.push(['@token', mobileToken]);
        }

        if (webToken) {
            items.push(['webtoken', webToken]);
        }

        if (items.length > 0) {
            await AsyncStorage.multiSet(items);
        }
    } catch (error) {
        console.error('Error storing tokens:', error);
    }
};

/**
 * Handle token expiration - clear data and show error
 */
export const handleTokenExpiration = async (): Promise<void> => {
    try {
        await clearAuthData();
        // Safely show error toast
        try {
            showErrorToast('Session expired. Please login again.', 'Authentication Error');
        } catch (toastError) {
            console.error('Error showing toast:', toastError);
        }
    } catch (error) {
        console.error('Error handling token expiration:', error);
    }
};

/**
 * Validate token format (basic JWT structure check)
 */
export const validateTokenFormat = (token: string): boolean => {
    try {
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Basic JWT structure check (3 parts separated by dots)
        const parts = token.split('.');
        return parts.length === 3;
    } catch (error) {
        console.error('Error validating token format:', error);
        return false;
    }
};

/**
 * Check if token is expired (basic check - you might want to decode JWT for exact expiration)
 */
export const isTokenExpired = (token: string): boolean => {
    if (!validateTokenFormat(token)) {
        return true;
    }

    try {
        // For now, we'll do a basic check without decoding JWT
        // In a production app, you might want to use a JWT library
        // or implement proper base64 decoding
        return false; // Assume token is valid for now
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // If we can't decode, assume expired
    }
};
