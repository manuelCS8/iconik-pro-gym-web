import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AuthNavigator from "./AuthNavigator";
import MemberNavigator from "./MemberNavigator";
import AdminNavigator from "./AdminNavigator";
import { RootState } from "../redux/store";

const AppNavigator: React.FC = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) return <AuthNavigator />;
  return role === "ADMIN" ? <AdminNavigator /> : <MemberNavigator />;
};

export default () => (
  <NavigationContainer>
    <AppNavigator />
  </NavigationContainer>
); 