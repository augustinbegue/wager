import 'package:flutter/material.dart';
import 'package:wager_app/styles/text_styles.dart';
import 'package:wager_app/widgets/matches/match_list_horizontal.dart';
import 'package:wager_app/widgets/matches/match_list_suggested.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                SizedBox(
                  height: 400,
                ),
                Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Welcome Back Augustin,',
                    textAlign: TextAlign.left,
                    style: whiteH1,
                  ),
                ),
                MatchListHorizontal(
                  title: 'Last Results',
                ),
                MatchListSuggested()
              ],
            ),
          ),
          decoration: const BoxDecoration(
              image: DecorationImage(
            image: AssetImage('assets/mbappe.jpg'),
            fit: BoxFit.cover,
          ))),
    );
  }
}
