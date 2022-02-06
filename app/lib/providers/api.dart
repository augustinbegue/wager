import 'dart:convert';

import 'package:http/http.dart' as http;

enum ApiStatus {
  SCHEDULED,
  LIVE,
  IN_PLAY,
  PAUSED,
  FINISHED,
  POSTPONED,
  SUSPENDED,
  CANCELED
}

enum ApiWinner { HOME_TEAM, AWAY_TEAM, DRAW }

class ApiScoreElement {
  final int? homeTeam;
  final int? awayTeam;

  const ApiScoreElement({required this.homeTeam, required this.awayTeam});

  factory ApiScoreElement.fromJson(Map<String, dynamic> json) {
    return ApiScoreElement(
        homeTeam: json['homeTeam'], awayTeam: json['awayTeam']);
  }
}

class ApiScore {
  final ApiWinner winner;
  final ApiScoreElement fullTime;
  final ApiScoreElement halfTime;
  final ApiScoreElement extraTime;
  final ApiScoreElement penalties;

  const ApiScore(
      {required this.winner,
      required this.fullTime,
      required this.halfTime,
      required this.extraTime,
      required this.penalties});

  factory ApiScore.fromJson(Map<String, dynamic> json) {
    return ApiScore(
        winner: ApiWinner.values[json['winner']],
        fullTime: ApiScoreElement.fromJson(json['fullTime']),
        halfTime: ApiScoreElement.fromJson(json['halfTime']),
        extraTime: ApiScoreElement.fromJson(json['extraTime']),
        penalties: ApiScoreElement.fromJson(json['penalties']));
  }
}

class ApiCompetitionCondensed {
  final String id;
  final String name;

  const ApiCompetitionCondensed({required this.id, required this.name});

  factory ApiCompetitionCondensed.fromJson(Map<String, dynamic> json) {
    return ApiCompetitionCondensed(id: json['id'], name: json['name']);
  }
}

class ApiSeasonCondensed {
  final int id;

  const ApiSeasonCondensed({required this.id});

  factory ApiSeasonCondensed.fromJson(Map<String, dynamic> json) {
    return ApiSeasonCondensed(id: json['id']);
  }
}

class ApiTeamCondensed {
  final String id;
  final String name;
  final String crestUrl;

  const ApiTeamCondensed(
      {required this.id, required this.name, required this.crestUrl});

  factory ApiTeamCondensed.fromJson(Map<String, dynamic> json) {
    return ApiTeamCondensed(
        id: json['id'], name: json['name'], crestUrl: json['crestUrl']);
  }
}

class ApiMatchCondensed {
  final String id;
  final ApiCompetitionCondensed competition;
  final ApiSeasonCondensed season;
  final int matchday;
  final String date;
  final ApiTeamCondensed homeTeam;
  final ApiTeamCondensed awayTeam;
  final ApiStatus status;

  const ApiMatchCondensed(
      {required this.id,
      required this.competition,
      required this.season,
      required this.matchday,
      required this.date,
      required this.homeTeam,
      required this.awayTeam,
      required this.status});

  factory ApiMatchCondensed.fromJson(Map<String, dynamic> json) {
    ApiStatus status = ApiStatus.SCHEDULED;
    ApiStatus.values.forEach((element) {
      if (element.toString() == json['status']) {
        status = element;
      }
    });

    return ApiMatchCondensed(
        id: json['id'],
        competition: ApiCompetitionCondensed.fromJson(json['competition']),
        season: ApiSeasonCondensed.fromJson(json['season']),
        matchday: json['matchday'],
        date: json['date'],
        homeTeam: ApiTeamCondensed.fromJson(json['homeTeam']),
        awayTeam: ApiTeamCondensed.fromJson(json['awayTeam']),
        status: status);
  }
}

class Api {
  static const String endpoint = 'heavy-fox-60.loca.lt';

  static Future<List<ApiMatchCondensed>> fetchWeekMatches() async {
    final response = await http.get(
        Uri(scheme: 'http', host: endpoint, path: '/matches/week', port: 3000));

    if (response.statusCode == 200) {
      print(response.body);

      final json = jsonDecode(response.body) as List<dynamic>;

      return json
          .map((e) => ApiMatchCondensed.fromJson(e as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load matches');
    }
  }
}
