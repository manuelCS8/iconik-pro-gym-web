import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TrainingProvider } from "./src/contexts/TrainingContext";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <TrainingProvider>
            <StatusBar 
              style="light" 
              backgroundColor="transparent" 
              translucent={true}
            />
            <AppNavigator />
          </TrainingProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
} 