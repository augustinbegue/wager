import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/styles/text_styles.dart';
import 'package:wager_app/widgets/matches/match_widget_small.dart';

class MatchWeekList extends StatefulWidget {
  final WeekMatchesList weekMatchesList;

  const MatchWeekList({Key? key, required this.weekMatchesList})
      : super(key: key);

  @override
  _MatchWeekListState createState() => _MatchWeekListState();
}

class _MatchWeekListState extends State<MatchWeekList> {
  List<MatchWidgetSmall> getWidgets(int indexD, int indexC) {
    return widget.weekMatchesList.days[indexD].competitions[indexC].matches
        .map((match) => MatchWidgetSmall(match: match))
        .toList();
  }

  List<Column> getColumns(int indexD) {
    return widget.weekMatchesList.days[indexD].competitions
        .map((competitionMatchesList) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 8, 0, 8),
            child: Row(
              children: [
                Image.network(
                    Uri(
                      scheme: 'https',
                      host: Api.endpoint,
                      path: competitionMatchesList.competition.emblemUrl,
                    ).toString(),
                    height: 24),
                Padding(
                    padding: const EdgeInsets.all(4),
                    child: Text(competitionMatchesList.competition.name,
                        style: blackLg, textAlign: TextAlign.left)),
              ],
            ),
          ),
          Column(
            children: getWidgets(
                indexD,
                widget.weekMatchesList.days[indexD].competitions
                    .indexOf(competitionMatchesList)),
          ),
        ],
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.weekMatchesList.days.length,
      itemBuilder: (context, indexD) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(0, 16, 0, 0),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(4.0),
              child: Column(
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.all(4),
                    child: Text(
                      widget.weekMatchesList.days[indexD].date
                          .toLocal()
                          .toIso8601String()
                          .split('T')[0],
                      style: blackXL,
                    ),
                  ),
                  ...getColumns(indexD),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
