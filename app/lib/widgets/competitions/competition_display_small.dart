import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/router.gr.dart';
import 'package:wager_app/styles/text_styles.dart';

class CompetitionWidgetSmall extends StatelessWidget {
  const CompetitionWidgetSmall({Key? key, required this.competition})
      : super(key: key);

  final ApiCompetition competition;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade100, width: 1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: InkWell(
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              CachedNetworkImage(
                placeholder: (context, url) => const Padding(
                  padding: EdgeInsets.all(2),
                  child: CircularProgressIndicator(),
                ),
                imageUrl: Uri(
                  scheme: 'http',
                  host: Api.endpoint,
                  path: competition.emblemUrl,
                ).toString(),
                width: 50,
                height: 50,
              ),
              const SizedBox(width: 8),
              Text(competition.name, style: blackXL),
            ],
          ),
        ),
        onTap: () => {
          context.router.push(CompetitionRoute(competitionId: competition.id)),
        },
      ),
    );
  }
}
