declare module 'react-native-version-check' {
  interface NeedUpdateResult {
    isNeeded: boolean;
    storeUrl: string;
    currentVersion: string;
    latestVersion: string;
  }

  interface NeedUpdateOption {
    currentVersion?: string;
    latestVersion?: string;
    depth?: number;
    ignoreErrors?: boolean;
  }

  interface VersionCheck {
    getCurrentVersion: () => string;
    getCurrentBuildNumber: () => number;
    getPackageName: () => string;
    getCountry: () => Promise<string>;
    getLatestVersion: (option?: any) => Promise<string>;
    getStoreUrl: (option?: any) => Promise<string>;
    getAppStoreUrl: (option?: any) => Promise<string>;
    getPlayStoreUrl: (option?: any) => Promise<string>;
    needUpdate: (option?: NeedUpdateOption) => Promise<NeedUpdateResult>;
  }

  const VersionCheck: VersionCheck;
  export default VersionCheck;
}

