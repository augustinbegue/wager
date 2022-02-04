import 'package:flutter/material.dart';
import 'package:wager_app/widgets/matches/match_widget_small.dart';

class MatchListSuggested extends StatefulWidget {
  const MatchListSuggested({Key? key}) : super(key: key);

  @override
  _MatchListSuggestedState createState() => _MatchListSuggestedState();
}

class _MatchListSuggestedState extends State<MatchListSuggested> {
  final String title = 'Suggested Matches';

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 32,
              child: Text(
                title,
                textAlign: TextAlign.left,
                style: const TextStyle(fontSize: 16),
              ),
            ),
            Column(
              children: [
                MatchWidgetSmall(),
                MatchWidgetSmall(),
                MatchWidgetSmall()
              ],
            )
          ],
        ),
      ),
    );
  }
}
