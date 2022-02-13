import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/styles/text_styles.dart';
import 'package:wager_app/widgets/competitions/competition_standings.dart';
import 'package:wager_app/widgets/matches/match_list.dart';

class CompetitionPage extends StatefulWidget {
  const CompetitionPage({
    Key? key,
    required this.competitionId,
  }) : super(key: key);

  final int competitionId;

  @override
  _CompetitionPageState createState() => _CompetitionPageState();
}

class _CompetitionPageState extends State<CompetitionPage> {
  DateTime startDate = DateTime.now().subtract(const Duration(days: 1));
  DateTime endDate = DateTime.now().add(const Duration(days: 6));

  late Future<ApiCompetition> competition;
  late Future<List<ApiMatchCondensed>> matches;

  @override
  void initState() {
    super.initState();
    competition = Api.getCompetitionById(widget.competitionId, true);
    matches = Api.getMatches(startDate, endDate, widget.competitionId);
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
                        scheme: 'https',
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
                        Text(formattedSeasonDate, style: whiteSmall),
                      ],
                    )
                  ],
                ),
                bottom: const TabBar(
                  tabs: [
                    Tab(text: 'Matches'),
                    Tab(text: 'Standings'),
                  ],
                ),
              ),
              body: TabBarView(
                children: [
                  FutureBuilder<List<ApiMatchCondensed>>(
                    future: matches,
                    builder: (context, snapshot) {
                      if (snapshot.hasData) {
                        return MatchList(
                          matches: snapshot.data as List<ApiMatchCondensed>,
                        );
                      } else if (snapshot.hasError) {
                        return Center(
                          child: Text('Error: ${snapshot.error}'),
                        );
                      } else {
                        return const Center(
                          child: CircularProgressIndicator(),
                        );
                      }
                    },
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
