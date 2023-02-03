import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/providers/ws_api.dart';
import 'package:wager_app/utilities/date_time_utils.dart';

import '../decorations/pulse_circle.dart';

class MatchWidgetDetails extends StatefulWidget {
  final ApiMatchCondensed match;

  const MatchWidgetDetails({Key? key, required this.match}) : super(key: key);

  @override
  _MatchWidgetDetailsState createState() => _MatchWidgetDetailsState();
}

class _MatchWidgetDetailsState extends State<MatchWidgetDetails> {
  late DateTime _date;
  late String _formattedDate;
  late int _homeTeamScore;
  late int _awayTeamScore;
  late ApiStatus _status;
  late ApiBetInfo _betInfo;
  late int? _minutes;
  late Timer _liveTimer;
  ApiBet? _bet;

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
      _minutes = widget.match.score.minutes;
      _liveTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
        setState(() {
          _minutes = _minutes != null ? _minutes! + 1 : null;
        });
      });
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
    List<Widget> getScoreRows(
        ApiMatchCondensed matchData, String formattedDate, int? minutes) {
      if (matchData.status == ApiStatus.FINISHED) {
        // Match is Finished
        return [
          Text(
            '${matchData.score.fullTime.homeTeam} - ${matchData.score.fullTime.awayTeam}',
            style: Theme.of(context).textTheme.headline4,
          ),
          Text(formattedDate),
          Text('Matchday ${matchData.matchday}'),
        ];
      } else if (matchData.status == ApiStatus.IN_PLAY ||
          matchData.status == ApiStatus.PAUSED) {
        // Match is in Progress
        return [
          Text(
            '${matchData.score.fullTime.homeTeam} - ${matchData.score.fullTime.awayTeam}',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          matchData.status == ApiStatus.IN_PLAY
              ? Row(
                  children: [
                    Text("$minutes'"),
                    const SizedBox(width: 4),
                    const PulseCircle(),
                  ],
                )
              : Text(
                  'Half Time',
                  style: Theme.of(context)
                      .textTheme
                      .bodyText2
                      ?.copyWith(color: Colors.redAccent),
                )
        ];
      } else {
        // Match is Scheduled
        return [
          Text(formattedDate),
          Text('Matchday ${matchData.matchday}'),
        ];
      }
    }

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          bottom: PreferredSize(
            preferredSize: Size.fromHeight(128),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
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
                              path: widget.match.homeTeam.crestUrl,
                            ).toString(),
                            width: 32,
                            height: 32,
                          ),
                          Text(
                            widget.match.homeTeam.name,
                            style: Theme.of(context).textTheme.headline6,
                          ),
                        ],
                      ),
                      Column(
                        children: getScoreRows(
                            widget.match, _formattedDate, _minutes),
                      ),
                      Column(
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
                              path: widget.match.awayTeam.crestUrl,
                            ).toString(),
                            width: 32,
                            height: 32,
                          ),
                          Text(
                            widget.match.awayTeam.name,
                            style: Theme.of(context).textTheme.headline6,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                TabBar(
                  tabs: const <Widget>[
                    Tab(
                      text: 'Match',
                    ),
                    Tab(
                      text: 'Head 2 Head',
                    ),
                    Tab(
                      text: 'Standings',
                    )
                  ],
                  indicatorColor: Theme.of(context).colorScheme.primary,
                ),
              ],
            ),
          ),
        ),
        body: const TabBarView(
          children: [
            Text('Match'),
            Text('Head 2 Head'),
            Text('Standings'),
          ],
        ),
      ),
    );
  }
}
