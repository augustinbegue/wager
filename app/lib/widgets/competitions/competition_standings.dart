import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:wager_app/providers/api.dart';

import '../../utilities/platform_detection.dart';

class CompetitionStandings extends StatefulWidget {
  const CompetitionStandings({Key? key, required this.competition})
      : super(key: key);

  final ApiCompetition competition;

  @override
  _CompetitionStandingsState createState() => _CompetitionStandingsState();
}

class _CompetitionStandingsState extends State<CompetitionStandings> {
  @override
  Widget build(BuildContext context) {
    List<ApiStandingsEntry> standings =
        widget.competition.standings as List<ApiStandingsEntry>;

    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
              width: constraints.maxWidth,
              child: DataTable(
                columnSpacing: 20,
                columns: const <DataColumn>[
                  DataColumn(
                    label: Text(''),
                  ),
                  DataColumn(
                    label: Text('Team'),
                  ),
                  DataColumn(
                    label: Text('P'),
                  ),
                  DataColumn(
                    label: Text('W'),
                  ),
                  DataColumn(
                    label: Text('D'),
                  ),
                  DataColumn(
                    label: Text('L'),
                  ),
                  DataColumn(
                    label: Text('Goals'),
                  ),
                ],
                rows: <DataRow>[
                  for (int i = 0; i < standings.length; i++)
                    DataRow(
                      color: MaterialStateProperty.resolveWith<Color?>(
                          (Set<MaterialState> states) {
                        // All rows will have the same selected color.
                        if (states.contains(MaterialState.selected)) {
                          return Theme.of(context)
                              .colorScheme
                              .primary
                              .withOpacity(0.20);
                        }
                        // Even rows will have a grey color.
                        if (i.isEven) {
                          return Theme.of(context)
                              .primaryColorLight
                              .withOpacity(0.20);
                        }
                        return null; // Use default value for other states and odd rows.
                      }),
                      cells: <DataCell>[
                        DataCell(
                          Text((i + 1).toString()),
                        ),
                        DataCell(Row(
                          children: [
                            CachedNetworkImage(
                              placeholder: (context, url) => const Padding(
                                padding: EdgeInsets.all(2),
                                child: CircularProgressIndicator(),
                              ),
                              imageUrl: Uri(
                                scheme: 'http',
                                host: Api.endpoint,
                                path: standings[i].team.crestUrl,
                              ).toString(),
                              height: PlatformDetection.isMobile() ? 20 : 24,
                              width: PlatformDetection.isMobile() ? 20 : 24,
                            ),
                            const SizedBox(width: 4),
                            Text(standings[i].team.name),
                          ],
                        )),
                        DataCell(
                          Text(standings[i].points.toString()),
                        ),
                        DataCell(
                          Text(standings[i].won.toString()),
                        ),
                        DataCell(
                          Text(standings[i].draw.toString()),
                        ),
                        DataCell(
                          Text(standings[i].lost.toString()),
                        ),
                        DataCell(
                          Text(standings[i].goalsFor.toString() +
                              ":" +
                              standings[i].goalsAgainst.toString()),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
