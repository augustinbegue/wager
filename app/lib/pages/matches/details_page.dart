import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

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
  @override
  Widget build(BuildContext context) {
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
                          Text('Image'),
                          Text(
                            'Paris SG',
                            style: Theme.of(context).textTheme.headline6,
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            '3 - 0',
                            style: Theme.of(context).textTheme.headline4,
                          ),
                          Text('date'),
                          Text('matchday'),
                        ],
                      ),
                      Column(
                        children: [
                          Text('Image'),
                          Text(
                            'Paris SG',
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
