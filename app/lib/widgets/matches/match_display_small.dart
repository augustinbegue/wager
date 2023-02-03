import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/providers/ws_api.dart';
import 'package:wager_app/router.gr.dart';
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
  late DateTime _date;
  late String _formattedDate;
  late int _homeTeamScore;
  late int _awayTeamScore;
  late ApiStatus _status;
  late ApiBetInfo _betInfo;
  late int? _minutes;
  late Timer _liveTimer;
  ApiBet? _bet;

  void startMatch() {
    _minutes = widget.match.score.minutes ?? 1;

    _liveTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
      setState(() {
        _minutes = _minutes != null ? _minutes! + 1 : null;
      });
    });
  }

  @override
  void initState() {
    super.initState();
    _date = widget.match.date;
    _formattedDate = DateTimeUtils.formatDateToSmallDisplay(_date);
    _homeTeamScore = widget.match.score.fullTime.homeTeam!;
    _awayTeamScore = widget.match.score.fullTime.awayTeam!;
    _status = widget.match.status;
    _betInfo = widget.match.betInfo;
    _bet = widget.match.bet;

    if (_status == ApiStatus.IN_PLAY || _status == ApiStatus.PAUSED) {
      startMatch();
    } else {
      _minutes = 0;
    }

    // Listen for live data changes if the match is Scheduled or Live
    if (_status == ApiStatus.SCHEDULED ||
        _status == ApiStatus.IN_PLAY ||
        _status == ApiStatus.PAUSED) {
      final WSApi wsApi = Provider.of<WSApi>(context, listen: false);
      wsApi.addListener(() {
        WSMessage message = wsApi.message;

        if (message.matchId == widget.match.id) {
          if (message.event == WSEvent.MATCH_UPDATE) {
            if (message.type == WSEventType.HOME_TEAM_SCORE) {
              setState(() {
                _homeTeamScore = message.value!;
              });
            } else if (message.type == WSEventType.AWAY_TEAM_SCORE) {
              setState(() {
                _awayTeamScore = message.value!;
              });
            } else if (message.type == WSEventType.ODDS) {
              setState(() {
                _betInfo = ApiBetInfo.fromJson(message.value!);
              });
            }
          } else if (message.event == WSEvent.MATCH_START) {
            setState(() {
              _status = ApiStatus.IN_PLAY;
            });
            startMatch();
          } else if (message.event == WSEvent.MATCH_END) {
            setState(() {
              _status = ApiStatus.FINISHED;
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
          child: Text(_formattedDate),
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(0, 6, 0, 0),
          child: Icon(Icons.add),
        ),
      ],
    );

    Row inPlayLayout = Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Padding(
              padding: const EdgeInsets.all(6),
              child: Text(
                _homeTeamScore.toString(),
                style: homeTeamTextStyle,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(6),
              child: Text(
                _awayTeamScore.toString(),
                style: awayTeamTextStyle,
              ),
            ),
          ],
        ),
        _status == ApiStatus.IN_PLAY
            ? Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: [
                    Text(_minutes.toString() + "'"),
                    const SizedBox(width: 4),
                    const PulseCircle(),
                  ],
                ),
              )
            : _status == ApiStatus.PAUSED
                ? Padding(
                    padding: const EdgeInsets.all(2),
                    child: Text(
                      'Half Time',
                      style: Theme.of(context)
                          .textTheme
                          .bodyText2
                          ?.copyWith(color: Colors.redAccent),
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.all(2),
                    child: Text(
                      'Full Time',
                      style: Theme.of(context).textTheme.bodyText2,
                    ),
                  ),
      ],
    );

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
                  betInfo: _betInfo,
                  betType: betType,
                ),
              ),
            ],
          );
        },
      );

      setState(() {
        this._bet = bet;
      });
    }

    return Card(
      margin: const EdgeInsets.all(0),
      elevation: 0.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(0),
      ),
      child: InkWell(
        onTap: () {
          context.pushRoute(DetailsRoute(matchId: widget.match.id));
        },
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(widget.match.id.toString()),
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
                                        port: Api.port,
                                        path: widget.match.homeTeam.crestUrl,
                                      ).toString(),
                                      width: PlatformDetection.isMobile()
                                          ? 22
                                          : 36,
                                      height: PlatformDetection.isMobile()
                                          ? 22
                                          : 36,
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
                                        port: Api.port,
                                        path: widget.match.awayTeam.crestUrl,
                                      ).toString(),
                                      width: PlatformDetection.isMobile()
                                          ? 22
                                          : 36,
                                      height: PlatformDetection.isMobile()
                                          ? 22
                                          : 36,
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
                          child: _status == ApiStatus.SCHEDULED
                              ? scheduledLayout
                              : inPlayLayout,
                          flex: 3,
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
                            flex: 11 - _betInfo.resultHomeTeamOdd.round(),
                            child: Container(
                              decoration: BoxDecoration(
                                color: team1Color,
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 11 - _betInfo.resultDrawOdd.round(),
                            child: Container(
                              color: drawColor,
                            ),
                          ),
                          Expanded(
                            flex: 11 - _betInfo.resultAwayTeamOdd.round(),
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
                              'E1 - x${(_betInfo.resultHomeTeamOdd * 100).roundToDouble() / 100}',
                            ),
                            style: ButtonStyle(
                              foregroundColor: _bet?.type ==
                                      ApiBetType.RESULT_HOME_TEAM
                                  ? MaterialStateProperty.all<Color>(
                                      Theme.of(context).colorScheme.onPrimary)
                                  : MaterialStateProperty.all<Color>(
                                      team1Color),
                              backgroundColor: _bet?.type ==
                                      ApiBetType.RESULT_HOME_TEAM
                                  ? MaterialStateProperty.all<Color>(team1Color)
                                  : null,
                              textStyle: MaterialStateProperty.all(
                                Theme.of(context).textTheme.button?.copyWith(
                                      fontWeight:
                                          _bet == null && _betInfo.opened
                                              ? FontWeight.w700
                                              : FontWeight.w200,
                                    ),
                              ),
                              elevation: _bet == null && _betInfo.opened
                                  ? MaterialStateProperty.all(1)
                                  : null,
                            ),
                            onPressed: _bet != null || !_betInfo.opened
                                ? null
                                : () {
                                    showNewBetModal(
                                        ApiBetType.RESULT_HOME_TEAM);
                                  },
                          ),
                        ),
                        Expanded(
                          child: TextButton(
                            child: Text(
                              'N - x${(_betInfo.resultDrawOdd * 100).roundToDouble() / 100}',
                            ),
                            style: ButtonStyle(
                              foregroundColor: _bet?.type ==
                                      ApiBetType.RESULT_DRAW
                                  ? MaterialStateProperty.all<Color>(
                                      Theme.of(context).colorScheme.onPrimary)
                                  : MaterialStateProperty.all<Color>(drawColor),
                              backgroundColor: _bet?.type ==
                                      ApiBetType.RESULT_DRAW
                                  ? MaterialStateProperty.all<Color>(drawColor)
                                  : null,
                              textStyle: MaterialStateProperty.all(
                                Theme.of(context).textTheme.button?.copyWith(
                                      fontWeight:
                                          _bet == null && _betInfo.opened
                                              ? FontWeight.w700
                                              : FontWeight.w200,
                                    ),
                              ),
                              elevation: _bet == null && _betInfo.opened
                                  ? MaterialStateProperty.all(1)
                                  : null,
                            ),
                            onPressed: _bet != null || !_betInfo.opened
                                ? null
                                : () {
                                    showNewBetModal(ApiBetType.RESULT_DRAW);
                                  },
                          ),
                        ),
                        Expanded(
                          child: TextButton(
                            child: Text(
                              'E2 - x${(_betInfo.resultAwayTeamOdd * 100).roundToDouble() / 100}',
                            ),
                            style: ButtonStyle(
                              foregroundColor: _bet?.type ==
                                      ApiBetType.RESULT_AWAY_TEAM
                                  ? MaterialStateProperty.all<Color>(
                                      Theme.of(context).colorScheme.onPrimary)
                                  : MaterialStateProperty.all<Color>(
                                      team2Color),
                              backgroundColor: _bet?.type ==
                                      ApiBetType.RESULT_AWAY_TEAM
                                  ? MaterialStateProperty.all<Color>(team2Color)
                                  : null,
                              textStyle: MaterialStateProperty.all(
                                Theme.of(context).textTheme.button?.copyWith(
                                      fontWeight:
                                          _bet == null && _betInfo.opened
                                              ? FontWeight.w700
                                              : FontWeight.w200,
                                    ),
                              ),
                              elevation: _bet == null && _betInfo.opened
                                  ? MaterialStateProperty.all(1)
                                  : null,
                            ),
                            onPressed: _bet != null || !_betInfo.opened
                                ? null
                                : () {
                                    showNewBetModal(
                                        ApiBetType.RESULT_AWAY_TEAM);
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
      ),
    );
  }
}
