/**
 * @format
 */
import 'react-native-reanimated'; // top of the file
import { Appearance, AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

Appearance.setColorScheme("light");
LogBox.ignoreAllLogs(true);
AppRegistry.registerComponent(appName, () => App);
