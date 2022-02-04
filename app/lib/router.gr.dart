// **************************************************************************
// AutoRouteGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouteGenerator
// **************************************************************************
//
// ignore_for_file: type=lint

import 'package:auto_route/auto_route.dart' as _i2;
import 'package:flutter/material.dart' as _i8;

import 'pages/default_page.dart' as _i1;
import 'pages/history_page.dart' as _i6;
import 'pages/home_page.dart' as _i3;
import 'pages/matches_page.dart' as _i5;
import 'pages/profile_page.dart' as _i7;
import 'pages/ranking_page.dart' as _i4;

class AppRouter extends _i2.RootStackRouter {
  AppRouter([_i8.GlobalKey<_i8.NavigatorState>? navigatorKey])
      : super(navigatorKey);

  @override
  final Map<String, _i2.PageFactory> pagesMap = {
    DefaultRoute.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i1.DefaultPage());
    },
    HomeRouter.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i2.EmptyRouterPage());
    },
    RankingRouter.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i2.EmptyRouterPage());
    },
    MatchesRouter.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i2.EmptyRouterPage());
    },
    HistoryRouter.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i2.EmptyRouterPage());
    },
    ProfileRouter.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i2.EmptyRouterPage());
    },
    HomeRoute.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i3.HomePage());
    },
    RankingRoute.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i4.RankingPage());
    },
    MatchesRoute.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i5.MatchesPage());
    },
    HistoryRoute.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i6.HistoryPage());
    },
    ProfileRoute.name: (routeData) {
      return _i2.MaterialPageX<dynamic>(
          routeData: routeData, child: const _i7.ProfilePage());
    }
  };

  @override
  List<_i2.RouteConfig> get routes => [
        _i2.RouteConfig(DefaultRoute.name, path: '/', children: [
          _i2.RouteConfig(HomeRouter.name,
              path: '',
              parent: DefaultRoute.name,
              children: [
                _i2.RouteConfig(HomeRoute.name,
                    path: '', parent: HomeRouter.name)
              ]),
          _i2.RouteConfig(RankingRouter.name,
              path: 'ranking',
              parent: DefaultRoute.name,
              children: [
                _i2.RouteConfig(RankingRoute.name,
                    path: '', parent: RankingRouter.name)
              ]),
          _i2.RouteConfig(MatchesRouter.name,
              path: 'matches',
              parent: DefaultRoute.name,
              children: [
                _i2.RouteConfig(MatchesRoute.name,
                    path: '', parent: MatchesRouter.name)
              ]),
          _i2.RouteConfig(HistoryRouter.name,
              path: 'history',
              parent: DefaultRoute.name,
              children: [
                _i2.RouteConfig(HistoryRoute.name,
                    path: '', parent: HistoryRouter.name)
              ]),
          _i2.RouteConfig(ProfileRouter.name,
              path: 'profile',
              parent: DefaultRoute.name,
              children: [
                _i2.RouteConfig(ProfileRoute.name,
                    path: '', parent: ProfileRouter.name)
              ])
        ])
      ];
}

/// generated route for
/// [_i1.DefaultPage]
class DefaultRoute extends _i2.PageRouteInfo<void> {
  const DefaultRoute({List<_i2.PageRouteInfo>? children})
      : super(DefaultRoute.name, path: '/', initialChildren: children);

  static const String name = 'DefaultRoute';
}

/// generated route for
/// [_i2.EmptyRouterPage]
class HomeRouter extends _i2.PageRouteInfo<void> {
  const HomeRouter({List<_i2.PageRouteInfo>? children})
      : super(HomeRouter.name, path: '', initialChildren: children);

  static const String name = 'HomeRouter';
}

/// generated route for
/// [_i2.EmptyRouterPage]
class RankingRouter extends _i2.PageRouteInfo<void> {
  const RankingRouter({List<_i2.PageRouteInfo>? children})
      : super(RankingRouter.name, path: 'ranking', initialChildren: children);

  static const String name = 'RankingRouter';
}

/// generated route for
/// [_i2.EmptyRouterPage]
class MatchesRouter extends _i2.PageRouteInfo<void> {
  const MatchesRouter({List<_i2.PageRouteInfo>? children})
      : super(MatchesRouter.name, path: 'matches', initialChildren: children);

  static const String name = 'MatchesRouter';
}

/// generated route for
/// [_i2.EmptyRouterPage]
class HistoryRouter extends _i2.PageRouteInfo<void> {
  const HistoryRouter({List<_i2.PageRouteInfo>? children})
      : super(HistoryRouter.name, path: 'history', initialChildren: children);

  static const String name = 'HistoryRouter';
}

/// generated route for
/// [_i2.EmptyRouterPage]
class ProfileRouter extends _i2.PageRouteInfo<void> {
  const ProfileRouter({List<_i2.PageRouteInfo>? children})
      : super(ProfileRouter.name, path: 'profile', initialChildren: children);

  static const String name = 'ProfileRouter';
}

/// generated route for
/// [_i3.HomePage]
class HomeRoute extends _i2.PageRouteInfo<void> {
  const HomeRoute() : super(HomeRoute.name, path: '');

  static const String name = 'HomeRoute';
}

/// generated route for
/// [_i4.RankingPage]
class RankingRoute extends _i2.PageRouteInfo<void> {
  const RankingRoute() : super(RankingRoute.name, path: '');

  static const String name = 'RankingRoute';
}

/// generated route for
/// [_i5.MatchesPage]
class MatchesRoute extends _i2.PageRouteInfo<void> {
  const MatchesRoute() : super(MatchesRoute.name, path: '');

  static const String name = 'MatchesRoute';
}

/// generated route for
/// [_i6.HistoryPage]
class HistoryRoute extends _i2.PageRouteInfo<void> {
  const HistoryRoute() : super(HistoryRoute.name, path: '');

  static const String name = 'HistoryRoute';
}

/// generated route for
/// [_i7.ProfilePage]
class ProfileRoute extends _i2.PageRouteInfo<void> {
  const ProfileRoute() : super(ProfileRoute.name, path: '');

  static const String name = 'ProfileRoute';
}
