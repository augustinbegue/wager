import 'package:flutter/material.dart';

import '../widgets/matches/match_widget_small.dart';

class MatchesPage extends StatefulWidget {
  const MatchesPage({Key? key}) : super(key: key);

  @override
  _MatchesPageState createState() => _MatchesPageState();
}

class _MatchesPageState extends State<MatchesPage> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
        length: 3,
        child: Scaffold(
          appBar: AppBar(
            title: const Text('Matches'),
            bottom: const TabBar(tabs: <Widget>[
              Tab(
                text: 'Favorites',
              ),
              Tab(
                text: 'Day',
              ),
              Tab(
                text: 'Competition',
              )
            ]),
          ),
          body: TabBarView(
            children: <Widget>[
              Center(
                  child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                  MatchWidgetSmall(),
                ],
              )),
              Center(
                child: Text("Matches of the day tab"),
              ),
              Center(
                child: Text("Matches by competition"),
              ),
            ],
          ),
        ));
  }
}
