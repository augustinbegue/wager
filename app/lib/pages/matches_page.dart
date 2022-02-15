import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/widgets/competitions/competition_display_small.dart';
import 'package:wager_app/widgets/matches/match_week_list.dart';

class MatchesPage extends StatefulWidget {
  const MatchesPage({Key? key}) : super(key: key);

  @override
  _MatchesPageState createState() => _MatchesPageState();
}

class _MatchesPageState extends State<MatchesPage> {
  late Future<WeekMatchesList> matches;
  late Future<List<ApiCompetition>> competitions;

  @override
  void initState() {
    super.initState();
    matches = Api.getWeekMatchesList();
    competitions = Api.getCompetitions();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Matches'),
          bottom: TabBar(
            tabs: const <Widget>[
              Tab(
                text: 'Favorites',
              ),
              Tab(
                text: 'Week',
              ),
              Tab(
                text: 'Competitions',
              )
            ],
            indicatorColor: Theme.of(context).colorScheme.primary,
          ),
        ),
        body: TabBarView(
          children: <Widget>[
            const Center(
              child: Text("Favorites tab"),
            ),
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

                  return const CircularProgressIndicator();
                },
              ),
            ),
            Center(
              child: FutureBuilder<List<ApiCompetition>>(
                future: competitions,
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return ListView.builder(
                      itemCount: snapshot.data?.length,
                      itemBuilder: (context, index) {
                        return CompetitionWidgetSmall(
                          competition: snapshot.data![index],
                        );
                      },
                    );
                  } else if (snapshot.hasError) {
                    return Text("${snapshot.error}");
                  }

                  return const Center(child: CircularProgressIndicator());
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
