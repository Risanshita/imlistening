import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import './custom.css';
import { PrivateRoute } from './Util';

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Layout>
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, isPrivate, ...rest } = route;
            return isPrivate ?
              <Route key={'routekey' + index.toString()} {...rest} element={<PrivateRoute />}>
                <Route key={'routekey_child' + index.toString()} {...rest} element={element} />
              </Route> :
              <Route key={'routekey' + index.toString()} {...rest} element={element} />
          })}
        </Routes>
      </Layout>
    );
  }
}
