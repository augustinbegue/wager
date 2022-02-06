import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/widgets/matches/match_week_list.dart';

class MatchesPage extends StatefulWidget {
  const MatchesPage({Key? key}) : super(key: key);

  @override
  _MatchesPageState createState() => _MatchesPageState();
}

class _MatchesPageState extends State<MatchesPage> {
  late Future<WeekMatchesList> matches;

  @override
  void initState() {
    super.initState();
    matches = Api.fetchWeekMatchesList();
  }

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
                child: FutureBuilder<WeekMatchesList>(
                  future: matches,
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      return MatchWeekList(
                        weekMatchesList: snapshot.data!,
                      );
                    } else if (snapshot.hasError) {
                      return Text("${snapshot.error}");
                    }

                    return CircularProgressIndicator();
                  },
                ),
              ),
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
