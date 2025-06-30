import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/contexts/ThemeContext";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </Provider>
  );
} 