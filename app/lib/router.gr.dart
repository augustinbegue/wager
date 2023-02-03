// **************************************************************************
// AutoRouteGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouteGenerator
// **************************************************************************
//
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i9;
import 'package:auto_route/empty_router_widgets.dart' as _i3;
import 'package:flutter/material.dart' as _i10;

import 'pages/default_page.dart' as _i1;
import 'pages/home_page.dart' as _i4;
import 'pages/matches/competition_page.dart' as _i8;
import 'pages/matches/details_page.dart' as _i7;
import 'pages/matches_page.dart' as _i6;
import 'pages/profile_page.dart' as _i2;
import 'pages/ranking_page.dart' as _i5;

class AppRouter extends _i9.RootStackRouter {
  AppRouter([_i10.GlobalKey<_i10.NavigatorState>? navigatorKey])
      : super(navigatorKey);

  @override
  final Map<String, _i9.PageFactory> pagesMap = {
    DefaultRoute.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i1.DefaultPage(),
      );
    },
    ProfileRoute.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i2.ProfilePage(),
      );
    },
    HomeRouter.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i3.EmptyRouterPage(),
      );
    },
    RankingRouter.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i3.EmptyRouterPage(),
      );
    },
    MatchesRouter.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i3.EmptyRouterPage(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i4.HomePage(),
      );
    },
    RankingRoute.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i5.RankingPage(),
      );
    },
    MatchesRoute.name: (routeData) {
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: const _i6.MatchesPage(),
      );
    },
    DetailsRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<DetailsRouteArgs>(
          orElse: () =>
              DetailsRouteArgs(matchId: pathParams.getInt('matchId')));
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: _i7.DetailsPage(
          key: args.key,
          matchId: args.matchId,
        ),
      );
    },
    CompetitionRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<CompetitionRouteArgs>(
          orElse: () => CompetitionRouteArgs(
              competitionId: pathParams.getInt('competitionId')));
      return _i9.MaterialPageX<dynamic>(
        routeData: routeData,
        child: _i8.CompetitionPage(
          key: args.key,
          competitionId: args.competitionId,
        ),
      );
    },
  };

  @override
  List<_i9.RouteConfig> get routes => [
        _i9.RouteConfig(
          DefaultRoute.name,
          path: '/',
          children: [
            _i9.RouteConfig(
              HomeRouter.name,
              path: '',
              parent: DefaultRoute.name,
              children: [
                _i9.RouteConfig(
                  HomeRoute.name,
                  path: '',
                  parent: HomeRouter.name,
                )
              ],
            ),
            _i9.RouteConfig(
              RankingRouter.name,
              path: 'ranking',
              parent: DefaultRoute.name,
              children: [
                _i9.RouteConfig(
                  RankingRoute.name,
                  path: '',
                  parent: RankingRouter.name,
                )
              ],
            ),
            _i9.RouteConfig(
              MatchesRouter.name,
              path: 'matches',
              parent: DefaultRoute.name,
              children: [
                _i9.RouteConfig(
                  MatchesRoute.name,
                  path: '',
                  parent: MatchesRouter.name,
                ),
                _i9.RouteConfig(
                  DetailsRoute.name,
                  path: ':matchId',
                  parent: MatchesRouter.name,
                ),
                _i9.RouteConfig(
                  CompetitionRoute.name,
                  path: 'competition/:competitionId',
                  parent: MatchesRouter.name,
                ),
              ],
            ),
          ],
        ),
        _i9.RouteConfig(
          ProfileRoute.name,
          path: '/profile',
        ),
      ];
}

/// generated route for
/// [_i1.DefaultPage]
class DefaultRoute extends _i9.PageRouteInfo<void> {
  const DefaultRoute({List<_i9.PageRouteInfo>? children})
      : super(
          DefaultRoute.name,
          path: '/',
          initialChildren: children,
        );

  static const String name = 'DefaultRoute';
}

/// generated route for
/// [_i2.ProfilePage]
class ProfileRoute extends _i9.PageRouteInfo<void> {
  const ProfileRoute()
      : super(
          ProfileRoute.name,
          path: '/profile',
        );

  static const String name = 'ProfileRoute';
}

/// generated route for
/// [_i3.EmptyRouterPage]
class HomeRouter extends _i9.PageRouteInfo<void> {
  const HomeRouter({List<_i9.PageRouteInfo>? children})
      : super(
          HomeRouter.name,
          path: '',
          initialChildren: children,
        );

  static const String name = 'HomeRouter';
}

/// generated route for
/// [_i3.EmptyRouterPage]
class RankingRouter extends _i9.PageRouteInfo<void> {
  const RankingRouter({List<_i9.PageRouteInfo>? children})
      : super(
          RankingRouter.name,
          path: 'ranking',
          initialChildren: children,
        );

  static const String name = 'RankingRouter';
}

/// generated route for
/// [_i3.EmptyRouterPage]
class MatchesRouter extends _i9.PageRouteInfo<void> {
  const MatchesRouter({List<_i9.PageRouteInfo>? children})
      : super(
          MatchesRouter.name,
          path: 'matches',
          initialChildren: children,
        );

  static const String name = 'MatchesRouter';
}

/// generated route for
/// [_i4.HomePage]
class HomeRoute extends _i9.PageRouteInfo<void> {
  const HomeRoute()
      : super(
          HomeRoute.name,
          path: '',
        );

  static const String name = 'HomeRoute';
}

/// generated route for
/// [_i5.RankingPage]
class RankingRoute extends _i9.PageRouteInfo<void> {
  const RankingRoute()
      : super(
          RankingRoute.name,
          path: '',
        );

  static const String name = 'RankingRoute';
}

/// generated route for
/// [_i6.MatchesPage]
class MatchesRoute extends _i9.PageRouteInfo<void> {
  const MatchesRoute()
      : super(
          MatchesRoute.name,
          path: '',
        );

  static const String name = 'MatchesRoute';
}

/// generated route for
/// [_i7.DetailsPage]
class DetailsRoute extends _i9.PageRouteInfo<DetailsRouteArgs> {
  DetailsRoute({
    _i10.Key? key,
    required int matchId,
  }) : super(
          DetailsRoute.name,
          path: ':matchId',
          args: DetailsRouteArgs(
            key: key,
            matchId: matchId,
          ),
          rawPathParams: {'matchId': matchId},
        );

  static const String name = 'DetailsRoute';
}

class DetailsRouteArgs {
  const DetailsRouteArgs({
    this.key,
    required this.matchId,
  });

  final _i10.Key? key;

  final int matchId;

  @override
  String toString() {
    return 'DetailsRouteArgs{key: $key, matchId: $matchId}';
  }
}

/// generated route for
/// [_i8.CompetitionPage]
class CompetitionRoute extends _i9.PageRouteInfo<CompetitionRouteArgs> {
  CompetitionRoute({
    _i10.Key? key,
    required int competitionId,
  }) : super(
          CompetitionRoute.name,
          path: 'competition/:competitionId',
          args: CompetitionRouteArgs(
            key: key,
            competitionId: competitionId,
          ),
          rawPathParams: {'competitionId': competitionId},
        );

  static const String name = 'CompetitionRoute';
}

class CompetitionRouteArgs {
  const CompetitionRouteArgs({
    this.key,
    required this.competitionId,
  });

  final _i10.Key? key;

  final int competitionId;

  @override
  String toString() {
    return 'CompetitionRouteArgs{key: $key, competitionId: $competitionId}';
  }
}
