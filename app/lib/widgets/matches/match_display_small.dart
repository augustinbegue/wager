import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/providers/live_api.dart';

import '../decorations/pulse_circle.dart';

class MatchWidgetSmall extends StatefulWidget {
  final ApiMatchCondensed match;
  const MatchWidgetSmall({Key? key, required this.match}) : super(key: key);

  @override
  _MatchWidgetSmallState createState() => _MatchWidgetSmallState();
}

class _MatchWidgetSmallState extends State<MatchWidgetSmall> {
  final Color team1Color = Colors.blue.shade900;
  final Color drawColor = Colors.blueGrey.shade100;
  final Color team2Color = Colors.red.shade400;

  int homeTeamScore = 0;
  int awayTeamScore = 0;

  ApiStatus status = ApiStatus.FINISHED;

  @override
  Widget build(BuildContext context) {
    DateTime date = widget.match.date;
    String formattedDate =
        "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')} - ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}";

    final homeTeamTextStyle = Theme.of(context).textTheme.bodyText2?.copyWith(
        fontWeight: widget.match.score.winner == ApiWinner.HOME_TEAM
            ? FontWeight.bold
            : FontWeight.normal);

    final awayTeamTextStyle = Theme.of(context).textTheme.bodyText2?.copyWith(
        fontWeight: widget.match.score.winner == ApiWinner.AWAY_TEAM
            ? FontWeight.bold
            : FontWeight.normal);

    // Initialize data
    homeTeamScore = widget.match.score.fullTime.homeTeam!;
    awayTeamScore = widget.match.score.fullTime.awayTeam!;
    status = widget.match.status;

    // Listen for live data changes if the match is Scheduled or Live
    if (status == ApiStatus.SCHEDULED || status == ApiStatus.LIVE) {
      final WSApi wsApi = Provider.of<WSApi>(context, listen: false);
      wsApi.addListener(() {
        WSMessage message = wsApi.message;

        if (message.matchId == widget.match.id) {
          if (message.event == WSEvent.MATCH_UPDATE) {
            if (message.type == WSEventType.HOME_TEAM_SCORE) {
              setState(() {
                homeTeamScore = message.value!;
              });
            } else if (message.type == WSEventType.AWAY_TEAM_SCORE) {
              setState(() {
                awayTeamScore = message.value!;
              });
            }
          } else if (message.event == WSEvent.MATCH_START) {
            setState(() {
              status = ApiStatus.IN_PLAY;
            });
          } else if (message.event == WSEvent.MATCH_END) {
            setState(() {
              status = ApiStatus.FINISHED;
            });
          }
        }
      });
    }

    Column scheduledLayout = Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(formattedDate),
        const Icon(Icons.add),
      ],
    );

    Row inPlayLayout =
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(6),
            child: Text(
              homeTeamScore.toString(),
              style: homeTeamTextStyle,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(6),
            child: Text(
              awayTeamScore.toString(),
              style: awayTeamTextStyle,
            ),
          ),
        ],
      ),
      widget.match.status == ApiStatus.IN_PLAY
          ? const Padding(padding: EdgeInsets.all(10), child: PulseCircle())
          : const Padding(padding: EdgeInsets.all(2), child: Icon(Icons.check))
    ]);

    return Card(
      margin: const EdgeInsets.all(0),
      elevation: 0.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Padding(
                padding: const EdgeInsets.all(8),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Padding(
                            padding: const EdgeInsets.all(4),
                            child: Row(children: <Widget>[
                              CachedNetworkImage(
                                placeholder: (context, url) => const Padding(
                                  padding: EdgeInsets.all(2),
                                  child: CircularProgressIndicator(),
                                ),
                                imageUrl: Uri(
                                  scheme: 'http',
                                  host: Api.endpoint,
                                  path: widget.match.homeTeam.crestUrl,
                                ).toString(),
                                width: 20,
                                height: 20,
                              ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(4, 0, 0, 0),
                                child: Text(
                                  widget.match.homeTeam.name,
                                  style: homeTeamTextStyle,
                                ),
                              )
                            ]),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(4),
                            child: Row(children: <Widget>[
                              CachedNetworkImage(
                                placeholder: (context, url) => const Padding(
                                  padding: EdgeInsets.all(2),
                                  child: CircularProgressIndicator(),
                                ),
                                imageUrl: Uri(
                                  scheme: 'http',
                                  host: Api.endpoint,
                                  path: widget.match.awayTeam.crestUrl,
                                ).toString(),
                                width: 20,
                                height: 20,
                              ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(4, 0, 0, 0),
                                child: Text(
                                  widget.match.awayTeam.name,
                                  style: awayTeamTextStyle,
                                ),
                              )
                            ]),
                          ),
                        ],
                      ),
                    ),
                    widget.match.status == ApiStatus.SCHEDULED
                        ? scheduledLayout
                        : inPlayLayout
                  ],
                )),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
                  child: SizedBox(
                    height: 4,
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          flex: 3,
                          child: Container(
                            decoration: BoxDecoration(
                              color: team1Color,
                              borderRadius: const BorderRadius.horizontal(
                                left: Radius.circular(10),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: Container(
                            color: drawColor,
                          ),
                        ),
                        Expanded(
                          flex: 6,
                          child: Container(
                            decoration: BoxDecoration(
                              color: team2Color,
                              borderRadius: const BorderRadius.horizontal(
                                right: Radius.circular(10),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Row(
                  children: <Widget>[
                    Expanded(
                        child: TextButton(
                      child: const Text('E1 - x2.4'),
                      style: ButtonStyle(
                        foregroundColor:
                            MaterialStateProperty.all<Color>(team1Color),
                      ),
                      onPressed: () {
                        /* ... */
                      },
                    )),
                    Expanded(
                        child: TextButton(
                      child: const Text('N - x4.1'),
                      style: ButtonStyle(
                        foregroundColor:
                            MaterialStateProperty.all<Color>(drawColor),
                      ),
                      onPressed: () {
                        /* ... */
                      },
                    )),
                    Expanded(
                        child: TextButton(
                      child: const Text('E1 - x1.2'),
                      style: ButtonStyle(
                        foregroundColor:
                            MaterialStateProperty.all<Color>(team2Color),
                      ),
                      onPressed: () {
                        /* ... */
                      },
                    )),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
