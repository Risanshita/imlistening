import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  return isLogin() ? (
    <Outlet />
  ) : (
    <Navigate
      to={{ pathname: "/login", state: { from: window.location.pathname } }}
    />
  );
};

export const isLogin = () => (localStorage.getItem("user") ? true : false);

export function authHeader(haeders) {
  let user = JSON.parse(localStorage.getItem("user"));

  if (user?.authdata) {
    return {
      Authorization: "Basic " + user.authdata,
      "X-UserId": user.id,
      ...(haeders ? haeders : {}),
    };
  } else {
    return haeders ? haeders : {};
  }
}
export function authdata() {
  let user = JSON.parse(localStorage.getItem("user"));

  return user?.authdata;
}

export function getUserId() {
  let user = JSON.parse(localStorage.getItem("user"));

  return user?.id;
}

export function logout() {
  localStorage.removeItem("user");
}
