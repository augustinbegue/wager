import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/providers/ws_api.dart';
import 'package:wager_app/utilities/date_time_utils.dart';
import 'package:wager_app/widgets/bets/new_bet_modal.dart';

import '../../utilities/platform_detection.dart';
import '../decorations/pulse_circle.dart';

class MatchWidgetSmall extends StatefulWidget {
  final ApiMatchCondensed match;
  const MatchWidgetSmall({Key? key, required this.match}) : super(key: key);

  @override
  _MatchWidgetSmallState createState() => _MatchWidgetSmallState();
}

class _MatchWidgetSmallState extends State<MatchWidgetSmall> {
  late int homeTeamScore;
  late int awayTeamScore;
  late ApiStatus status;
  late ApiBetInfo betInfo;
  ApiBet? bet;

  @override
  void initState() {
    super.initState();
    homeTeamScore = widget.match.score.fullTime.homeTeam!;
    awayTeamScore = widget.match.score.fullTime.awayTeam!;
    status = widget.match.status;
    betInfo = widget.match.betInfo;
    bet = widget.match.bet;

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
            } else if (message.type == WSEventType.ODDS) {
              setState(() {
                betInfo = ApiBetInfo.fromJson(message.value!);
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
  }

  @override
  Widget build(BuildContext context) {
    Color team1Color = Theme.of(context).colorScheme.primary;
    Color drawColor = Theme.of(context).colorScheme.secondary;
    Color team2Color = Theme.of(context).colorScheme.tertiary;

    DateTime date = widget.match.date;
    String formattedDate = DateTimeUtils.formatDateToSmallDisplay(date);

    final homeTeamTextStyle = Theme.of(context).textTheme.bodyText2?.copyWith(
        fontWeight: widget.match.score.winner == ApiWinner.HOME_TEAM
            ? FontWeight.bold
            : FontWeight.normal);

    final awayTeamTextStyle = Theme.of(context).textTheme.bodyText2?.copyWith(
        fontWeight: widget.match.score.winner == ApiWinner.AWAY_TEAM
            ? FontWeight.bold
            : FontWeight.normal);

    Column scheduledLayout = Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(0, 6, 0, 0),
          child: Text(formattedDate),
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(0, 6, 0, 0),
          child: Icon(Icons.add),
        ),
      ],
    );

    Row inPlayLayout =
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
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

    void showNewBetModal(ApiBetType betType) async {
      ApiBet? bet = await showModalBottomSheet<ApiBet>(
        context: context,
        isScrollControlled: true,
        builder: (BuildContext context) {
          return Wrap(
            children: [
              SingleChildScrollView(
                child: NewBetModal(
                  match: widget.match,
                  betInfo: betInfo,
                  betType: betType,
                ),
              ),
            ],
          );
        },
      );

      setState(() {
        this.bet = bet;
      });
    }

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
                child: IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        flex: 6,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Padding(
                              padding: const EdgeInsets.all(4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: <Widget>[
                                  CachedNetworkImage(
                                    placeholder: (context, url) =>
                                        const Padding(
                                      padding: EdgeInsets.all(2),
                                      child: CircularProgressIndicator(),
                                    ),
                                    imageUrl: Uri(
                                      scheme: 'http',
                                      host: Api.endpoint,
                                      path: widget.match.homeTeam.crestUrl,
                                    ).toString(),
                                    width:
                                        PlatformDetection.isMobile() ? 22 : 36,
                                    height:
                                        PlatformDetection.isMobile() ? 22 : 36,
                                  ),
                                  Padding(
                                    padding:
                                        const EdgeInsets.fromLTRB(8, 0, 0, 0),
                                    child: Text(
                                      widget.match.homeTeam.name,
                                      style: homeTeamTextStyle,
                                    ),
                                  )
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: <Widget>[
                                  CachedNetworkImage(
                                    placeholder: (context, url) =>
                                        const Padding(
                                      padding: EdgeInsets.all(2),
                                      child: CircularProgressIndicator(),
                                    ),
                                    imageUrl: Uri(
                                      scheme: 'http',
                                      host: Api.endpoint,
                                      path: widget.match.awayTeam.crestUrl,
                                    ).toString(),
                                    width:
                                        PlatformDetection.isMobile() ? 22 : 36,
                                    height:
                                        PlatformDetection.isMobile() ? 22 : 36,
                                  ),
                                  Padding(
                                    padding:
                                        const EdgeInsets.fromLTRB(8, 0, 0, 0),
                                    child: Text(
                                      widget.match.awayTeam.name,
                                      style: awayTeamTextStyle,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const VerticalDivider(
                        width: 32,
                        thickness: 1,
                      ),
                      Expanded(
                        child: widget.match.status == ApiStatus.SCHEDULED
                            ? scheduledLayout
                            : inPlayLayout,
                        flex: 2,
                      )
                    ],
                  ),
                )),
            Padding(
              padding: const EdgeInsets.fromLTRB(8.0, 8.0, 8.0, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    height: 4,
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          flex: betInfo.resultHomeTeamOdd.round(),
                          child: Container(
                            decoration: BoxDecoration(
                              color: team1Color,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: betInfo.resultDrawOdd.round(),
                          child: Container(
                            color: drawColor,
                          ),
                        ),
                        Expanded(
                          flex: betInfo.resultAwayTeamOdd.round(),
                          child: Container(
                            decoration: BoxDecoration(
                              color: team2Color,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: TextButton(
                          child: Text(
                            'E1 - x${(betInfo.resultHomeTeamOdd * 100).roundToDouble() / 100}',
                          ),
                          style: ButtonStyle(
                            foregroundColor: bet?.type ==
                                    ApiBetType.RESULT_HOME_TEAM
                                ? MaterialStateProperty.all<Color>(
                                    Theme.of(context).colorScheme.onPrimary)
                                : MaterialStateProperty.all<Color>(team1Color),
                            backgroundColor: bet?.type ==
                                    ApiBetType.RESULT_HOME_TEAM
                                ? MaterialStateProperty.all<Color>(team1Color)
                                : null,
                            textStyle: MaterialStateProperty.all(
                              Theme.of(context).textTheme.button?.copyWith(
                                    fontWeight: bet == null
                                        ? FontWeight.w700
                                        : FontWeight.w200,
                                  ),
                            ),
                          ),
                          onPressed: bet != null
                              ? null
                              : () {
                                  showNewBetModal(ApiBetType.RESULT_HOME_TEAM);
                                },
                        ),
                      ),
                      Expanded(
                        child: TextButton(
                          child: Text(
                            'N - x${(betInfo.resultDrawOdd * 100).roundToDouble() / 100}',
                          ),
                          style: ButtonStyle(
                            foregroundColor: bet?.type == ApiBetType.RESULT_DRAW
                                ? MaterialStateProperty.all<Color>(
                                    Theme.of(context).colorScheme.onPrimary)
                                : MaterialStateProperty.all<Color>(drawColor),
                            backgroundColor: bet?.type == ApiBetType.RESULT_DRAW
                                ? MaterialStateProperty.all<Color>(drawColor)
                                : null,
                            textStyle: MaterialStateProperty.all(
                              Theme.of(context).textTheme.button?.copyWith(
                                    fontWeight: bet == null
                                        ? FontWeight.w700
                                        : FontWeight.w200,
                                  ),
                            ),
                          ),
                          onPressed: bet != null
                              ? null
                              : () {
                                  showNewBetModal(ApiBetType.RESULT_DRAW);
                                },
                        ),
                      ),
                      Expanded(
                        child: TextButton(
                          child: Text(
                            'E2 - x${(betInfo.resultAwayTeamOdd * 100).roundToDouble() / 100}',
                          ),
                          style: ButtonStyle(
                            foregroundColor: bet?.type ==
                                    ApiBetType.RESULT_AWAY_TEAM
                                ? MaterialStateProperty.all<Color>(
                                    Theme.of(context).colorScheme.onPrimary)
                                : MaterialStateProperty.all<Color>(team2Color),
                            backgroundColor: bet?.type ==
                                    ApiBetType.RESULT_AWAY_TEAM
                                ? MaterialStateProperty.all<Color>(team2Color)
                                : null,
                            textStyle: MaterialStateProperty.all(
                              Theme.of(context).textTheme.button?.copyWith(
                                    fontWeight: bet == null
                                        ? FontWeight.w700
                                        : FontWeight.w200,
                                  ),
                            ),
                          ),
                          onPressed: bet != null
                              ? null
                              : () {
                                  showNewBetModal(ApiBetType.RESULT_AWAY_TEAM);
                                },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
