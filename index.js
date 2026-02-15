import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Hide the annoying Firebase v23+ deprecation warnings
LogBox.ignoreLogs([
  'This method is deprecated', 
  'SafeAreaView has been deprecated'
]);

AppRegistry.registerComponent(appName, () => App);