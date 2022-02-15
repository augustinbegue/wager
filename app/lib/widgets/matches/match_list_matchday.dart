import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';

import 'match_list.dart';

class MatchListMatchday extends StatefulWidget {
  const MatchListMatchday(
      {Key? key, required this.competitionId, required this.currentMatchday})
      : super(key: key);

  final int competitionId;
  final int currentMatchday;

  @override
  _MatchListMatchdayState createState() => _MatchListMatchdayState();
}

class _MatchListMatchdayState extends State<MatchListMatchday> {
  late int matchday;
  late Future<List<ApiMatchCondensed>> matches;

  @override
  void initState() {
    super.initState();
    matchday = widget.currentMatchday;
    matches = Api.getMatches(null, null, widget.competitionId, matchday);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            IconButton(
              onPressed: () {
                setState(() {
                  matchday = matchday - 1;
                  if (matchday < 1) {
                    matchday = 1;
                  }
                  matches = Api.getMatches(
                      null, null, widget.competitionId, matchday);
                });
              },
              icon: const Icon(Icons.chevron_left),
            ),
            Expanded(
              child: Text(
                'Matchday $matchday',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headline6,
              ),
            ),
            IconButton(
              onPressed: () {
                setState(() {
                  matchday = matchday + 1;
                  if (matchday > 37) {
                    matchday = 37;
                  }
                  matches = Api.getMatches(
                      null, null, widget.competitionId, matchday);
                });
              },
              icon: const Icon(Icons.chevron_right),
            ),
          ],
        ),
        Expanded(
          child: FutureBuilder<List<ApiMatchCondensed>>(
            future: matches,
            builder: (context, snapshot) {
              print(snapshot.connectionState);
              if (snapshot.connectionState == ConnectionState.done &&
                  snapshot.hasData) {
                print(snapshot.data);
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
        ),
      ],
    );
  }
}
