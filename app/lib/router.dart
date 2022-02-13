import 'package:auto_route/auto_route.dart';
import 'package:wager_app/pages/default_page.dart';
import 'package:wager_app/pages/history_page.dart';
import 'package:wager_app/pages/home_page.dart';
import 'package:wager_app/pages/matches/competition_page.dart';
import 'package:wager_app/pages/matches_page.dart';
import 'package:wager_app/pages/profile_page.dart';
import 'package:wager_app/pages/ranking_page.dart';

// Use flutter pub run build_runner watch to generate the actual routes
@MaterialAutoRouter(
  replaceInRouteName: 'Page,Route',
  routes: <AutoRoute>[
    AutoRoute(page: DefaultPage, path: '/', children: [
      AutoRoute(page: EmptyRouterPage, name: 'HomeRouter', path: '', children: [
        AutoRoute(path: '', page: HomePage),
      ]),
      AutoRoute(
          page: EmptyRouterPage,
          name: 'RankingRouter',
          path: 'ranking',
          children: [
            AutoRoute(path: '', page: RankingPage),
          ]),
      AutoRoute(
          page: EmptyRouterPage,
          name: 'MatchesRouter',
          path: 'matches',
          children: [
            AutoRoute(path: '', page: MatchesPage),
            AutoRoute(
                path: 'competition/:competitionId', page: CompetitionPage),
          ]),
      AutoRoute(
          page: EmptyRouterPage,
          name: 'HistoryRouter',
          path: 'history',
          children: [
            AutoRoute(path: '', page: HistoryPage),
          ]),
      AutoRoute(
          page: EmptyRouterPage,
          name: 'ProfileRouter',
          path: 'profile',
          children: [
            AutoRoute(path: '', page: ProfilePage),
          ]),
    ]),
  ],
)
class $AppRouter {}
