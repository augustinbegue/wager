import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

import '../utilities/date_time_utils.dart';

enum ApiStatus {
  SCHEDULED,
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
  final int? minutes;

  const ApiScore({
    required this.winner,
    required this.fullTime,
    required this.minutes,
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
      winner: winner,
      fullTime: ApiScoreElement.fromJson(json['fullTime']),
      minutes: json['minutes'],
    );
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

class ApiBetInfo {
  final int id;
  final bool opened;
  final bool finished;
  final double resultHomeTeamOdd;
  final double resultDrawOdd;
  final double resultAwayTeamOdd;
  final double resultHomeTeamOrDrawOdd;
  final double resultAwayTeamOrDrawOdd;
  final List<dynamic> goalsHomeTeamOdds;
  final List<dynamic> goalsAwayTeamOdds;

  const ApiBetInfo(
      {required this.id,
      required this.opened,
      required this.finished,
      required this.resultHomeTeamOdd,
      required this.resultDrawOdd,
      required this.resultAwayTeamOdd,
      required this.resultHomeTeamOrDrawOdd,
      required this.resultAwayTeamOrDrawOdd,
      required this.goalsHomeTeamOdds,
      required this.goalsAwayTeamOdds});

  factory ApiBetInfo.fromJson(Map<String, dynamic> json) {
    return ApiBetInfo(
        id: json['id'],
        opened: json['opened'],
        finished: json['finished'],
        resultHomeTeamOdd: json['resultHomeTeamOdd'].toDouble(),
        resultDrawOdd: json['resultDrawOdd'].toDouble(),
        resultAwayTeamOdd: json['resultAwayTeamOdd'].toDouble(),
        resultHomeTeamOrDrawOdd: json['resultHomeTeamOrDrawOdd'].toDouble(),
        resultAwayTeamOrDrawOdd: json['resultAwayTeamOrDrawOdd'].toDouble(),
        goalsHomeTeamOdds: json['goalsHomeTeamOdds'],
        goalsAwayTeamOdds: json['goalsAwayTeamOdds']);
  }
}

enum ApiBetType {
  RESULT_HOME_TEAM,
  RESULT_AWAY_TEAM,
  RESULT_HOME_TEAM_OR_DRAW,
  RESULT_AWAY_TEAM_OR_DRAW,
  RESULT_DRAW,
  GOALS_HOME_TEAM,
  GOALS_AWAY_TEAM
}

class ApiBet {
  final int id;
  final ApiBetType type;
  final int amount;
  final int? goals;

  const ApiBet(
      {required this.id,
      required this.type,
      required this.amount,
      required this.goals});

  factory ApiBet.fromJson(Map<String, dynamic> json) {
    ApiBetType type = ApiBetType.RESULT_HOME_TEAM;
    for (var element in ApiBetType.values) {
      final String elementName = element.toString().split('.')[1];
      if (elementName == json['type']) {
        type = element;
      }
    }

    return ApiBet(
        id: json['id'],
        type: type,
        amount: json['amount'],
        goals: json['goals']);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toString().split('.')[1],
      'amount': amount,
      'goals': goals
    };
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
  final ApiBetInfo betInfo;
  final ApiBet? bet;

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
    required this.betInfo,
    required this.bet,
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
      status: status,
      betInfo: ApiBetInfo.fromJson(json['betInfo']),
      bet: json['bet'] != null ? ApiBet.fromJson(json['bet']) : null,
    );
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
  bool isExpanded = true;

  DayMatchesList({required this.date, required this.competitions});
}

class WeekMatchesList {
  final List<DayMatchesList> days;

  const WeekMatchesList({required this.days});
}

class ApiSeason {
  final int id;
  final DateTime startDate;
  final DateTime endDate;
  final int currentMatchday;
  final int? winnerId;
  final int? pastCompetitionId;

  const ApiSeason(
      {required this.id,
      required this.startDate,
      required this.endDate,
      required this.currentMatchday,
      required this.winnerId,
      required this.pastCompetitionId});

  factory ApiSeason.fromJson(Map<String, dynamic> json) {
    return ApiSeason(
        id: json['id'],
        startDate: DateTime.parse(json['startDate']).toLocal(),
        endDate: DateTime.parse(json['endDate']).toLocal(),
        currentMatchday: json['currentMatchday'],
        winnerId: json['winnerId'],
        pastCompetitionId: json['pastCompetitionId']);
  }
}

class ApiStandingsEntry {
  final int id;
  final int teamId;
  final int playedGames;
  final int won;
  final int draw;
  final int lost;
  final int points;
  final int goalsFor;
  final int goalsAgainst;
  final int competitionId;
  final int seasonId;
  final ApiTeamCondensed team;

  const ApiStandingsEntry(
      {required this.id,
      required this.teamId,
      required this.playedGames,
      required this.won,
      required this.draw,
      required this.lost,
      required this.points,
      required this.goalsFor,
      required this.goalsAgainst,
      required this.competitionId,
      required this.seasonId,
      required this.team});

  factory ApiStandingsEntry.fromJson(Map<String, dynamic> json) {
    return ApiStandingsEntry(
        id: json['id'],
        teamId: json['teamId'],
        playedGames: json['playedGames'],
        won: json['won'],
        draw: json['draw'],
        lost: json['lost'],
        points: json['points'],
        goalsFor: json['goalsFor'],
        goalsAgainst: json['goalsAgainst'],
        competitionId: json['competitionId'],
        seasonId: json['seasonId'],
        team: ApiTeamCondensed.fromJson(json['team']));
  }
}

class ApiCompetition {
  final int id;
  final String name;
  final String emblemUrl;
  final ApiSeason currentSeason;
  final List<ApiStandingsEntry>? standings;

  const ApiCompetition(
      {required this.id,
      required this.name,
      required this.emblemUrl,
      required this.currentSeason,
      this.standings});

  factory ApiCompetition.fromJson(Map<String, dynamic> json) {
    return ApiCompetition(
      id: json['id'],
      name: json['name'],
      emblemUrl: json['emblemUrl'],
      currentSeason: ApiSeason.fromJson(json['currentSeason']),
      standings: json['standings'] != null
          ? List<ApiStandingsEntry>.from(
              json['standings'].map((x) => ApiStandingsEntry.fromJson(x)))
          : null,
    );
  }
}

class ApiUser {
  final int id;
  final String email;
  final String name;
  final String? photoUrl;
  final String uid;
  final double balance;

  const ApiUser({
    required this.id,
    required this.email,
    required this.name,
    required this.photoUrl,
    required this.uid,
    required this.balance,
  });

  factory ApiUser.fromJson(Map<String, dynamic> json) {
    return ApiUser(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      photoUrl: json['photoUrl'],
      uid: json['uid'],
      balance: json['balance'].toDouble(),
    );
  }
}

class Api {
  static const String endpoint =
      '192.168.1.105'; // '192.168.1.105'; //  '192.168.39.28';

  static const int port = 80;

  static Future<Map<String, String>> getAuthHeader() async {
    String? token;

    token = await FirebaseAuth.instance.currentUser?.getIdToken();

    if (token != null) {
      return {'Authorization': 'Bearer $token'};
    } else {
      return {};
    }
  }

  static Future<WeekMatchesList> getWeekMatchesList() async {
    final response = await http.get(
        Uri(scheme: 'http', host: endpoint, path: '/matches/week', port: port),
        headers: {
          ...await getAuthHeader(),
        });

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

  static Future<List<ApiMatchCondensed>> getMatches(
      DateTime? startDate, DateTime? endDate,
      [int? competitionId, int? matchday, int? seasonId, int? teamId]) async {
    Map<String, dynamic> startDateParam = startDate != null
        ? {'startDate': DateTimeUtils.formatDateToParam(startDate)}
        : {};
    Map<String, dynamic> endDateParam = endDate != null
        ? {'endDate': DateTimeUtils.formatDateToParam(endDate)}
        : {};
    Map<String, dynamic> competitionParam =
        competitionId != null ? {'competition': competitionId.toString()} : {};
    Map<String, dynamic> seasonParam =
        seasonId != null ? {'season': seasonId.toString()} : {};
    Map<String, dynamic> teamParam =
        teamId != null ? {'team': teamId.toString()} : {};
    Map<String, dynamic> matchdayParam =
        matchday != null ? {'matchday': matchday.toString()} : {};

    Map<String, dynamic> params = {
      ...startDateParam,
      ...endDateParam,
      ...competitionParam,
      ...seasonParam,
      ...teamParam,
      ...matchdayParam
    };

    Uri uri = Uri(
        scheme: 'http',
        host: endpoint,
        path: '/matches',
        queryParameters: params,
        port: port);

    final response = await http.get(uri, headers: {
      ...await getAuthHeader(),
    });

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);

      List<dynamic> matches = json['matches'];

      return matches
          .map((e) => ApiMatchCondensed.fromJson(e as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load matches.');
    }
  }

  static Future<List<ApiCompetition>> getCompetitions() async {
    final response = await http.get(
        Uri(scheme: 'http', host: endpoint, path: '/competitions', port: port));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as List<dynamic>;

      return json
          .map((e) => ApiCompetition.fromJson(e as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load competitions.');
    }
  }

  static Future<ApiCompetition> getCompetitionById(int id,
      [bool standings = false]) async {
    final response = await http.get(Uri(
        scheme: 'http',
        host: endpoint,
        path: '/competitions/$id/${standings ? 'standings' : ''}',
        port: port));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;

      return ApiCompetition.fromJson(json);
    } else {
      throw Exception('Failed to load competition.');
    }
  }

  static Future<void> postNewBet(int matchId, ApiBet bet) async {
    final response = await http.post(
        Uri(
            scheme: 'http',
            host: endpoint,
            path: '/bets/$matchId/new',
            port: port),
        headers: {
          ...await getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: jsonEncode(bet.toJson()));

    if (response.statusCode == 201) {
      return;
    } else {
      throw Exception('Failed to post bet.');
    }
  }

  static Future<ApiUser> getCurrentUser() async {
    final response = await http.get(
      Uri(scheme: 'http', host: endpoint, path: '/users/me', port: port),
      headers: {
        ...await getAuthHeader(),
      },
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;

      return ApiUser.fromJson(json);
    } else {
      throw Exception('Failed to load user.');
    }
  }
}
