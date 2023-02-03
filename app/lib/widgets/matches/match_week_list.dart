import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:date_format/date_format.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/utilities/platform_detection.dart';
import 'package:wager_app/widgets/matches/match_display_small.dart';

import '../../router.gr.dart';

class MatchWeekList extends StatefulWidget {
  final WeekMatchesList weekMatchesList;

  const MatchWeekList({Key? key, required this.weekMatchesList})
      : super(key: key);

  @override
  _MatchWeekListState createState() => _MatchWeekListState();
}

class _MatchWeekListState extends State<MatchWeekList> {
  Divider getDivider() => Divider(
        height: 1,
        color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
      );

  List<Widget> getMatchesContainer(int indexD, int indexC) {
    List<Widget> matches = [];

    // Add matches and dividers
    for (int i = 0;
        i <
            widget.weekMatchesList.days[indexD].competitions[indexC].matches
                .length;
        i++) {
      if (i != 0) {
        matches.add(
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
            child: getDivider(),
          ),
        );
      }

      matches.add(MatchWidgetSmall(
        match:
            widget.weekMatchesList.days[indexD].competitions[indexC].matches[i],
      ));
    }

    return matches;
  }

  List<Column> getCompetitionContainer(int indexD) {
    return widget.weekMatchesList.days[indexD].competitions
        .map((competitionMatchesList) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          InkWell(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: [
                  CachedNetworkImage(
                    placeholder: (context, url) => const Padding(
                      padding: EdgeInsets.all(2),
                      child: CircularProgressIndicator(),
                    ),
                    imageUrl: Uri(
                      scheme: 'http',
                      host: Api.endpoint,
                      port: Api.port,
                      path: competitionMatchesList.competition.emblemUrl,
                    ).toString(),
                    height: PlatformDetection.isMobile() ? 34 : 44,
                    width: PlatformDetection.isMobile() ? 34 : 44,
                  ),
                  Padding(
                      padding: const EdgeInsets.all(4),
                      child: Text(competitionMatchesList.competition.name,
                          style: Theme.of(context).textTheme.headline6,
                          textAlign: TextAlign.left)),
                ],
              ),
            ),
            onTap: () => {
              context.router.push(
                CompetitionRoute(
                  competitionId: competitionMatchesList.competition.id,
                ),
              ),
            },
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
            child: getDivider(),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: getMatchesContainer(
                  indexD,
                  widget.weekMatchesList.days[indexD].competitions
                      .indexOf(competitionMatchesList)),
            ),
          ),
        ],
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        ExpansionPanelList(
          expansionCallback: (int index, bool isExpanded) {
            setState(() {
              widget.weekMatchesList.days[index].isExpanded = !isExpanded;
            });
          },
          animationDuration: const Duration(milliseconds: 500),
          expandedHeaderPadding: const EdgeInsets.all(0),
          elevation: 0,
          children: widget.weekMatchesList.days.map((day) {
            return ExpansionPanel(
              canTapOnHeader: true,
              headerBuilder: (context, isExpanded) {
                return ListTile(
                  dense: true,
                  title: Text(
                    formatDate(
                      day.date,
                      [DD, ' ', d, ' ', MM],
                    ),
                    style: Theme.of(context).textTheme.headline5,
                  ),
                );
              },
              body: Column(
                children: getCompetitionContainer(
                  widget.weekMatchesList.days.indexOf(day),
                ),
              ),
              isExpanded: day.isExpanded,
            );
          }).toList(),
        ),
      ],
    );
  }
}
