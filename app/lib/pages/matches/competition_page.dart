import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/widgets/competitions/competition_standings.dart';
import 'package:wager_app/widgets/matches/match_list_matchday.dart';

class CompetitionPage extends StatefulWidget {
  const CompetitionPage({
    Key? key,
    @PathParam('competitionId') required this.competitionId,
  }) : super(key: key);

  final int competitionId;

  @override
  _CompetitionPageState createState() => _CompetitionPageState();
}

class _CompetitionPageState extends State<CompetitionPage> {
  late Future<ApiCompetition> competition;

  @override
  void initState() {
    super.initState();
    competition = Api.getCompetitionById(widget.competitionId, true);
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: FutureBuilder<ApiCompetition>(
        future: competition,
        builder: (context, snapshot) {
          if (snapshot.hasData && snapshot.data != null) {
            String formattedSeasonDate =
                (snapshot.data?.currentSeason.startDate.year.toString() ??
                        '2021') +
                    '-' +
                    (snapshot.data?.currentSeason.endDate.year.toString() ??
                        '2022');

            return Scaffold(
              appBar: AppBar(
                title: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CachedNetworkImage(
                      placeholder: (context, url) => const Padding(
                        padding: EdgeInsets.all(2),
                        child: CircularProgressIndicator(),
                      ),
                      imageUrl: Uri(
                        scheme: 'http',
                        host: Api.endpoint,
                        path: snapshot.data?.emblemUrl ??
                            'static/images/fallback.png',
                      ).toString(),
                      height: 48,
                      width: 48,
                    ),
                    const SizedBox(width: 4),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(snapshot.data?.name ?? 'Competition'),
                        Text(
                          formattedSeasonDate,
                          style: Theme.of(context).textTheme.caption?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                      ],
                    )
                  ],
                ),
                bottom: TabBar(
                  tabs: const [
                    Tab(text: 'Matches'),
                    Tab(text: 'Standings'),
                  ],
                  indicatorColor: Theme.of(context).colorScheme.primary,
                ),
              ),
              body: TabBarView(
                children: [
                  MatchListMatchday(
                    competitionId: widget.competitionId,
                    currentMatchday:
                        snapshot.data?.currentSeason.currentMatchday ?? 1,
                  ),
                  CompetitionStandings(
                    competition: snapshot.data as ApiCompetition,
                  ),
                ],
              ),
            );
          } else if (snapshot.hasError) {
            return Text("${snapshot.error}");
          }

          return const Center(
            child: CircularProgressIndicator(),
          );
        },
      ),
    );
  }
}
