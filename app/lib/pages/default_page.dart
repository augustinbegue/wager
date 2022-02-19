import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/widgets/auth/balance_widget.dart';

import '../router.gr.dart';

class DefaultPage extends StatefulWidget {
  const DefaultPage({Key? key}) : super(key: key);

  @override
  _DefaultPageState createState() => _DefaultPageState();
}

class _DefaultPageState extends State<DefaultPage> {
  @override
  Widget build(BuildContext context) {
    return AutoTabsScaffold(
      floatingActionButton: BalanceWidget(),
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
