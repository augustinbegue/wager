import 'package:auto_route/auto_route.dart';
import 'package:wager_app/pages/default_page.dart';
import 'package:wager_app/pages/home_page.dart';
import 'package:wager_app/pages/matches/competition_page.dart';
import 'package:wager_app/pages/matches/details_page.dart';
import 'package:wager_app/pages/matches_page.dart';
import 'package:wager_app/pages/profile_page.dart';
import 'package:wager_app/pages/ranking_page.dart';

// Use flutter pub run build_runner watch to generate the actual routes
@MaterialAutoRouter(
  replaceInRouteName: 'Page,Route',
  routes: <AutoRoute>[
    // Routes accessed from tabs
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
            AutoRoute(path: ':matchId', page: DetailsPage),
            AutoRoute(
                path: 'competition/:competitionId', page: CompetitionPage),
          ]),
    ]),
    // Other routes
    AutoRoute(path: '/profile', page: ProfilePage),
  ],
)
class $AppRouter {}
