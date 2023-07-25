
import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
    return localStorage.getItem('user')
        ? <Outlet />
        : <Navigate to={{ pathname: '/login', state: { from: window.location.pathname } }} />;
}

export function authHeader(haeders) {
    // return authorization header with basic auth credentials
    let user = JSON.parse(localStorage.getItem('user'));

    if (user?.authdata) {
        return {
            'Authorization': 'Basic ' + user.authdata,
            'X-UserId': user.id,
            ...(haeders ? haeders : {})
        };
    } else {
        return haeders ? haeders : {};
    }
}
export function authdata() {
    // return authorization header with basic auth credentials
    let user = JSON.parse(localStorage.getItem('user'));

    return user?.authdata;
}

export function getUserId() {
    let user = JSON.parse(localStorage.getItem('user'));
    return user?.id;
}

export function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
   
}

