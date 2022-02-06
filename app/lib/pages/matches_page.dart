import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/widgets/matches/match_widget_small.dart';

class MatchesPage extends StatefulWidget {
  const MatchesPage({Key? key}) : super(key: key);

  @override
  _MatchesPageState createState() => _MatchesPageState();
}

class _MatchesPageState extends State<MatchesPage> {
  late Future<List<ApiMatchCondensed>> matches;

  @override
  void initState() {
    super.initState();
    matches = Api.fetchWeekMatches();
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
                child: FutureBuilder<List<ApiMatchCondensed>>(
                  future: matches,
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      return ListView.builder(
                        itemCount: snapshot.data?.length,
                        itemBuilder: (context, index) {
                          return MatchWidgetSmall(match: snapshot.data![index]);
                        },
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
