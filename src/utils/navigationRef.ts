import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { Screens } from '../common/screens';

// Create a navigation reference
export const navigationRef = createNavigationContainerRef();

// Navigation utility functions
export const navigateToScreen = (screenName: string, params?: any) => {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.navigate({
                name: screenName,
                params,
            })
        );
    }
};

export const resetToScreen = (screenName: string) => {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: screenName }],
            })
        );
    }
};

export const navigateToSplash = () => {
    resetToScreen(Screens.Splash);
};

export const navigateToLogin = () => {
    resetToScreen(Screens.Login);
};
