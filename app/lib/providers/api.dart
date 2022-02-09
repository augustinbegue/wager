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
        homeTeam: json['homeTeam'] ?? 0, awayTeam: json['awayTeam'] ?? 0);
  }
}

class ApiScore {
  final ApiWinner winner;
  final ApiScoreElement fullTime;

  const ApiScore({
    required this.winner,
    required this.fullTime,
  });

  factory ApiScore.fromJson(Map<String, dynamic> json) {
    ApiWinner winner = ApiWinner.DRAW;
    for (var element in ApiWinner.values) {
      final String elementName = element.toString().split('.')[1];
      if (elementName == json['winner']) {
        winner = element;
      }
    }

    return ApiScore(
        winner: winner, fullTime: ApiScoreElement.fromJson(json['fullTime']));
  }
}

class ApiCompetitionCondensed {
  final int id;
  final String name;
  final String emblemUrl;

  const ApiCompetitionCondensed(
      {required this.id, required this.name, required this.emblemUrl});

  factory ApiCompetitionCondensed.fromJson(Map<String, dynamic> json) {
    return ApiCompetitionCondensed(
        id: json['id'], name: json['name'], emblemUrl: json['emblemUrl']);
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
  final int id;
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
  final int id;
  final ApiCompetitionCondensed competition;
  final ApiSeasonCondensed season;
  final int matchday;
  final DateTime date;
  final ApiTeamCondensed homeTeam;
  final ApiTeamCondensed awayTeam;
  final ApiStatus status;
  final ApiScore score;

  const ApiMatchCondensed({
    required this.id,
    required this.competition,
    required this.season,
    required this.matchday,
    required this.date,
    required this.homeTeam,
    required this.awayTeam,
    required this.status,
    required this.score,
  });

  factory ApiMatchCondensed.fromJson(Map<String, dynamic> json) {
    ApiStatus status = ApiStatus.SCHEDULED;
    for (var element in ApiStatus.values) {
      final String elementName = element.toString().split('.')[1];
      if (elementName == json['status']) {
        status = element;
      }
    }

    return ApiMatchCondensed(
        id: json['id'],
        competition: ApiCompetitionCondensed.fromJson(json['competition']),
        season: ApiSeasonCondensed.fromJson(json['season']),
        matchday: json['matchday'],
        date: DateTime.parse(json['date']).toLocal(),
        homeTeam: ApiTeamCondensed.fromJson(json['homeTeam']),
        awayTeam: ApiTeamCondensed.fromJson(json['awayTeam']),
        score: ApiScore.fromJson(json['score']),
        status: status);
  }
}

class CompetitionsMatchesList {
  final ApiCompetitionCondensed competition;
  final List<ApiMatchCondensed> matches;

  const CompetitionsMatchesList(
      {required this.matches, required this.competition});
}

class DayMatchesList {
  final DateTime date;
  final List<CompetitionsMatchesList> competitions;

  const DayMatchesList({required this.date, required this.competitions});
}

class WeekMatchesList {
  final List<DayMatchesList> days;

  const WeekMatchesList({required this.days});
}

class Api {
  static const String endpoint = 'cd71-73-202-235-133.ngrok.io';

  static Future<WeekMatchesList> fetchWeekMatchesList() async {
    final response = await http
        .get(Uri(scheme: 'http', host: endpoint, path: '/matches/week'));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as List<dynamic>;

      List<ApiMatchCondensed> matches = json
          .map((e) => ApiMatchCondensed.fromJson(e as Map<String, dynamic>))
          .toList();

      matches.sort((a, b) => a.date.compareTo(b.date));

      List<DateTime> dates = [];

      for (var match in matches) {
        DateTime matchDay =
            DateTime(match.date.year, match.date.month, match.date.day);

        if (!dates.contains(matchDay)) {
          dates.add(matchDay);
        }
      }

      List<ApiCompetitionCondensed> competitions = [];
      for (var match in matches) {
        if (!competitions.any((c) => c.name == match.competition.name)) {
          competitions.add(match.competition);
        }
      }

      List<DayMatchesList> days = [];

      for (var date in dates) {
        List<CompetitionsMatchesList> competitionsMatchesList = [];

        for (var competition in competitions) {
          List<ApiMatchCondensed> weekMatches = [];

          for (var match in matches) {
            DateTime matchDay =
                DateTime(match.date.year, match.date.month, match.date.day);

            if (matchDay == date &&
                match.competition.name == competition.name) {
              weekMatches.add(match);
            }
          }

          if (weekMatches.isNotEmpty) {
            competitionsMatchesList.add(CompetitionsMatchesList(
                matches: weekMatches, competition: competition));
          }
        }

        if (competitionsMatchesList.isNotEmpty) {
          days.add(DayMatchesList(
              date: date, competitions: competitionsMatchesList));
        }
      }

      return WeekMatchesList(days: days);
    } else {
      throw Exception('Failed to load matches');
    }
  }
}
