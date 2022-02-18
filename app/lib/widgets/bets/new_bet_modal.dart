import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';

import '../../utilities/platform_detection.dart';

enum SubmissionStatus {
  editing,
  submitting,
  error,
}

class NewBetModal extends StatefulWidget {
  const NewBetModal({
    Key? key,
    required this.match,
    required this.betInfo,
    required this.betType,
  }) : super(key: key);

  final ApiMatchCondensed match;
  final ApiBetInfo betInfo;
  final ApiBetType betType;

  @override
  _NewBetModalState createState() => _NewBetModalState();
}

class _NewBetModalState extends State<NewBetModal> {
  late ApiBetType _betType;
  late int _goals;
  late TextEditingController _controller;
  late SubmissionStatus _status;

  @override
  void initState() {
    _betType = widget.betType;
    _goals = 0;
    _controller = TextEditingController()..text = '1000';
    _status = SubmissionStatus.editing;
    super.initState();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void submit() async {
    try {
      setState(() {
        _status = SubmissionStatus.submitting;
      });

      ApiBet bet = ApiBet(
        id: 0,
        type: _betType,
        goals: _goals,
        amount: int.parse(_controller.text),
      );

      await Api.postNewBet(widget.match.id, bet);

      Navigator.pop(context, bet);

      return;
    } catch (e) {
      setState(() {
        _status = SubmissionStatus.error;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error submitting bet: $e'),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    var unselectedStyle = ButtonStyle(
      backgroundColor: MaterialStateProperty.all(
        Theme.of(context).colorScheme.secondary,
      ),
    );
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Column(
        children: [
          // Simple result bets
          Padding(
            padding: const EdgeInsets.all(8),
            child: Text(
              'Result',
              style: Theme.of(context).textTheme.headline5,
            ),
          ),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  style: _betType == ApiBetType.RESULT_HOME_TEAM
                      ? null
                      : unselectedStyle,
                  onPressed: () {
                    setState(() {
                      _betType = ApiBetType.RESULT_HOME_TEAM;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Column(
                      children: [
                        Text(
                          widget.match.homeTeam.name,
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                        Text(
                          'x${(widget.betInfo.resultHomeTeamOdd * 100).roundToDouble() / 100}',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headline5
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: ElevatedButton(
                  style: _betType == ApiBetType.RESULT_DRAW
                      ? null
                      : unselectedStyle,
                  onPressed: () {
                    setState(() {
                      _betType = ApiBetType.RESULT_DRAW;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Column(
                      children: [
                        Text(
                          'Draw',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                        Text(
                          'x${(widget.betInfo.resultDrawOdd * 100).roundToDouble() / 100}',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headline5
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: ElevatedButton(
                  style: _betType == ApiBetType.RESULT_AWAY_TEAM
                      ? null
                      : unselectedStyle,
                  onPressed: () {
                    setState(() {
                      _betType = ApiBetType.RESULT_AWAY_TEAM;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Column(
                      children: [
                        Text(
                          widget.match.awayTeam.name,
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                        Text(
                          'x${widget.betInfo.resultAwayTeamOdd}',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headline5
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const Divider(
            height: 16,
            thickness: 1,
          ),
          // Double chance result bets
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
            child: Text(
              'Double Chance',
              style: Theme.of(context).textTheme.headline5,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Expanded(
                child: ElevatedButton(
                  style: _betType == ApiBetType.RESULT_HOME_TEAM_OR_DRAW
                      ? null
                      : unselectedStyle,
                  onPressed: () {
                    setState(() {
                      _betType = ApiBetType.RESULT_HOME_TEAM_OR_DRAW;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Column(
                      children: [
                        Text(
                          '${widget.match.homeTeam.name} or Draw',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                        Text(
                          'x${(widget.betInfo.resultHomeTeamOrDrawOdd * 100).roundToDouble() / 100}',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headline5
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: ElevatedButton(
                  style: _betType == ApiBetType.RESULT_AWAY_TEAM_OR_DRAW
                      ? null
                      : unselectedStyle,
                  onPressed: () {
                    setState(() {
                      _betType = ApiBetType.RESULT_AWAY_TEAM_OR_DRAW;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Column(
                      children: [
                        Text(
                          '${widget.match.awayTeam.name} or Draw',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                        Text(
                          'x${(widget.betInfo.resultAwayTeamOrDrawOdd * 100).roundToDouble() / 100}',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headline5
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const Divider(
            height: 16,
            thickness: 1,
          ),
          // Goals Bets
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 4),
            child: Text(
              'Minimum Goals',
              style: Theme.of(context).textTheme.headline5,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(4.0),
            child: Text(
              widget.match.homeTeam.name,
              style: Theme.of(context).textTheme.headline6,
            ),
          ),
          SizedBox(
            height: PlatformDetection.isMobile() ? 44 : 64,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                for (int i = 0;
                    i < widget.betInfo.goalsHomeTeamOdds.length;
                    i++)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 0, 4, 4),
                    child: ElevatedButton(
                      style: _betType == ApiBetType.GOALS_HOME_TEAM &&
                              _goals == i + 1
                          ? null
                          : unselectedStyle,
                      onPressed: () {
                        setState(() {
                          _betType = ApiBetType.GOALS_HOME_TEAM;
                          _goals = i + 1;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${i + 1}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color:
                                      Theme.of(context).colorScheme.onPrimary,
                                ),
                          ),
                          Text(
                            'x${(widget.betInfo.goalsHomeTeamOdds[i] * 100).roundToDouble() / 100}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .headline6
                                ?.copyWith(
                                  color:
                                      Theme.of(context).colorScheme.onPrimary,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(4.0),
            child: Text(
              widget.match.awayTeam.name,
              style: Theme.of(context).textTheme.headline6,
            ),
          ),
          SizedBox(
            height: PlatformDetection.isMobile() ? 44 : 64,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                for (int i = 0;
                    i < widget.betInfo.goalsAwayTeamOdds.length;
                    i++)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 0, 4, 4),
                    child: ElevatedButton(
                      style: _betType == ApiBetType.GOALS_AWAY_TEAM &&
                              _goals == i + 1
                          ? null
                          : unselectedStyle,
                      onPressed: () {
                        setState(() {
                          _betType = ApiBetType.GOALS_AWAY_TEAM;
                          _goals = i + 1;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${i + 1}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color:
                                      Theme.of(context).colorScheme.onPrimary,
                                ),
                          ),
                          Text(
                            'x${(widget.betInfo.goalsAwayTeamOdds[i] * 100).roundToDouble() / 100}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .headline6
                                ?.copyWith(
                                  color:
                                      Theme.of(context).colorScheme.onPrimary,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const Divider(
            height: 16,
            thickness: 1,
          ),
          // Amount
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
            child: Text(
              'Amount',
              style: Theme.of(context).textTheme.headline5,
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  keyboardType: TextInputType.number,
                  controller: _controller,
                  decoration: const InputDecoration(
                    labelText: 'Amount',
                  ),
                  onSubmitted: (String value) {},
                ),
              ),
              IconButton(
                onPressed: () {
                  int value = int.parse(_controller.text);
                  _controller.text = '${value + 100}';
                },
                icon: const Icon(Icons.add),
              ),
              IconButton(
                onPressed: () {
                  int value = int.parse(_controller.text);

                  if (value > 100) {
                    _controller.text = '${value - 100}';
                  } else {
                    _controller.text = '0';
                  }
                },
                icon: const Icon(Icons.remove),
              ),
            ],
          ),
          // Submit/Cancel Buttons
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 16, 8, 8),
            child: SizedBox(
              height: PlatformDetection.isMobile() ? 42 : 42,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: _status == SubmissionStatus.submitting
                          ? null
                          : () {
                              Navigator.of(context).pop(null);
                            },
                      child: const Text(
                        'Cancel',
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _status == SubmissionStatus.submitting
                        ? const SizedBox(
                            width: double.infinity,
                            height: 40,
                            child: Center(
                              child: CircularProgressIndicator(),
                            ),
                          )
                        : ElevatedButton(
                            onPressed: () {
                              submit();
                            },
                            child: const Text(
                              'Confirm',
                            ),
                          ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
