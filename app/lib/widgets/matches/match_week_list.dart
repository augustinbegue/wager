import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/styles/text_styles.dart';
import 'package:wager_app/utilities/date_time_utils.dart';
import 'package:wager_app/widgets/matches/match_display_small.dart';

class MatchWeekList extends StatefulWidget {
  final WeekMatchesList weekMatchesList;

  const MatchWeekList({Key? key, required this.weekMatchesList})
      : super(key: key);

  @override
  _MatchWeekListState createState() => _MatchWeekListState();
}

class _MatchWeekListState extends State<MatchWeekList> {
  List<MatchWidgetSmall> getMatchesContainer(int indexD, int indexC) {
    return widget.weekMatchesList.days[indexD].competitions[indexC].matches
        .map((match) => MatchWidgetSmall(match: match))
        .toList();
  }

  List<Column> getCompetitionContainer(int indexD) {
    return widget.weekMatchesList.days[indexD].competitions
        .map((competitionMatchesList) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                CachedNetworkImage(
                  placeholder: (context, url) => const Padding(
                    padding: EdgeInsets.all(2),
                    child: CircularProgressIndicator(),
                  ),
                  imageUrl: Uri(
                    scheme: 'https',
                    host: Api.endpoint,
                    path: competitionMatchesList.competition.emblemUrl,
                  ).toString(),
                  height: 24,
                  width: 24,
                ),
                Padding(
                    padding: const EdgeInsets.all(4),
                    child: Text(competitionMatchesList.competition.name,
                        style: blackLg, textAlign: TextAlign.left)),
              ],
            ),
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
                  title: Text(
                    DateTimeUtils.formatDateToParam(day.date),
                    style: blackLg,
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
