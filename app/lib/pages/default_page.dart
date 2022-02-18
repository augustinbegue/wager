import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../router.gr.dart';
import '../services/authentication_service.dart';

class DefaultPage extends StatefulWidget {
  const DefaultPage({Key? key}) : super(key: key);

  @override
  _DefaultPageState createState() => _DefaultPageState();
}

class _DefaultPageState extends State<DefaultPage> {
  @override
  Widget build(BuildContext context) {
    final AuthenticationService authenticationService =
        Provider.of<AuthenticationService>(context);

    return AutoTabsScaffold(
      floatingActionButton: Row(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: Container(), flex: 1),
          Container(
            child: InkWell(
              splashColor:
                  Theme.of(context).colorScheme.onPrimary.withOpacity(0.5),
              child: authenticationService.isSignedIn
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // TODO: Collect amount from user
                        Text('140000',
                            style: Theme.of(context).textTheme.bodyText1),
                        SizedBox(width: 4),
                        Icon(Icons.account_balance_wallet),
                      ],
                    )
                  : Text('Login / Register',
                      style: Theme.of(context).textTheme.bodyText1),
              onTap: () {
                context.pushRoute(ProfileRoute());
              },
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.all(6),
            margin: const EdgeInsets.fromLTRB(0, 10, 0, 10),
          )
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endTop,
      routes: const [HomeRouter(), MatchesRouter(), RankingRouter()],
      bottomNavigationBuilder: (_, tabsRouter) {
        return BottomNavigationBar(
          unselectedItemColor: Theme.of(context).colorScheme.onBackground,
          selectedItemColor: Theme.of(context).colorScheme.primary,
          currentIndex: tabsRouter.activeIndex,
          onTap: tabsRouter.setActiveIndex,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_filled),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sports_soccer),
              label: 'Matches',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.list),
              label: 'Ranking',
            ),
          ],
        );
      },
    );
  }
}
