import 'package:flutter/material.dart';
import 'package:wager_app/widgets/matches/match_display_small.dart';

import '../../providers/api.dart';

class MatchList extends StatefulWidget {
  const MatchList({Key? key, required this.matches}) : super(key: key);

  final List<ApiMatchCondensed> matches;

  @override
  State<MatchList> createState() => _MatchListState();
}

class _MatchListState extends State<MatchList> {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.matches.length,
      itemBuilder: (context, index) {
        final match = widget.matches[index];
        return MatchWidgetSmall(match: match);
      },
    );
  }
}
