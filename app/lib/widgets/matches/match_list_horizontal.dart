import 'package:flutter/material.dart';
import 'package:wager_app/widgets/matches/match_widget_small.dart';

class MatchListHorizontal extends StatefulWidget {
  final String title;
  const MatchListHorizontal({Key? key, this.title = ""}) : super(key: key);

  @override
  _MatchListHorizontalState createState() => _MatchListHorizontalState();
}

class _MatchListHorizontalState extends State<MatchListHorizontal> {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              widget.title.length > 0
                  ? SizedBox(
                      height: 32,
                      child: Text(
                        widget.title,
                        textAlign: TextAlign.left,
                        style: const TextStyle(fontSize: 16),
                      ),
                    )
                  : Container(),
              SizedBox(
                height: 154,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: const <Widget>[
                    SizedBox(
                      width: 350,
                      child: MatchWidgetSmall(),
                    ),
                    SizedBox(
                      width: 350,
                      child: MatchWidgetSmall(),
                    ),
                    SizedBox(
                      width: 350,
                      child: MatchWidgetSmall(),
                    )
                  ],
                ),
              ),
            ],
          )),
    );
  }
}
