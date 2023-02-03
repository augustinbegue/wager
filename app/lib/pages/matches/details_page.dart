import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/widgets/matches/match_display_details.dart';

import '../../providers/api.dart';

class DetailsPage extends StatefulWidget {
  const DetailsPage({
    Key? key,
    @PathParam('matchId') required this.matchId,
  }) : super(key: key);

  final int matchId;

  @override
  _DetailsPageState createState() => _DetailsPageState();
}

class _DetailsPageState extends State<DetailsPage> {
  late Future<ApiMatchCondensed> match;

  @override
  void initState() {
    super.initState();
    match = Api.getMatch(widget.matchId);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ApiMatchCondensed>(
        future: match,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (snapshot.hasError) {
            return Text("${snapshot.error}");
          }

          return MatchWidgetDetails(match: snapshot.data!);
        });
  }
}
