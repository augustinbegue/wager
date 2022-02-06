import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';

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

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade100, width: 1),
        borderRadius: BorderRadius.circular(4),
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
                              SizedBox(
                                height: 20,
                                child: Image.network(Uri(
                                  scheme: 'https',
                                  host: Api.endpoint,
                                  path: widget.match.homeTeam.crestUrl,
                                ).toString()),
                              ),
                              Text(widget.match.homeTeam.name),
                            ]),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(4),
                            child: Row(children: <Widget>[
                              SizedBox(
                                height: 20,
                                child: Image.network(Uri(
                                  scheme: 'https',
                                  host: Api.endpoint,
                                  path: widget.match.awayTeam.crestUrl,
                                ).toString()),
                              ),
                              Text(widget.match.awayTeam.name),
                            ]),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Text(widget.match.date),
                        IconButton(
                            onPressed: () {
                              /* ... */
                            },
                            icon: const Icon(Icons.add)),
                      ],
                    )
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
