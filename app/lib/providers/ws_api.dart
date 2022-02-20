import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

enum WSEvent {
  MATCH_START,
  MATCH_END,
  MATCH_UPDATE,
  BALANCE_UPDATE,
}

enum WSEventType {
  HOME_TEAM_SCORE,
  AWAY_TEAM_SCORE,
  ODDS,
}

class WSMessage {
  WSEvent event;
  int? matchId;
  WSEventType? type;
  dynamic? value;

  WSMessage(
      {required this.event, required this.matchId, this.type, this.value});

  factory WSMessage.fromJson(Map<String, dynamic> json) {
    WSEvent event = WSEvent.MATCH_END;
    switch (json['event']) {
      case 'match-start':
        event = WSEvent.MATCH_START;
        break;
      case 'match-end':
        event = WSEvent.MATCH_END;
        break;
      case 'match-update':
        event = WSEvent.MATCH_UPDATE;
        break;
      case 'balance-update':
        event = WSEvent.BALANCE_UPDATE;
    }

    WSEventType? type;
    switch (json['type']) {
      case 'home-team-score':
        type = WSEventType.HOME_TEAM_SCORE;
        break;
      case 'away-team-score':
        type = WSEventType.AWAY_TEAM_SCORE;
        break;
      case 'odds':
        type = WSEventType.ODDS;
        break;
    }

    return WSMessage(
      type: type,
      value: json['value'],
      event: event,
      matchId: json['matchId'],
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['event'] = event;
    data['matchId'] = matchId;
    data['type'] = type;
    data['value'] = value;
    return data;
  }
}

class WSApi extends ChangeNotifier {
  static const String endpoint = 'localhost';
  static const int port = 4000;

  late WebSocketChannel channel;

  late WSMessage message;

  WSApi() {
    channel = WebSocketChannel.connect(Uri(
      scheme: 'ws',
      host: endpoint,
      port: port,
      path: '/ws',
    ));

    channel.stream.listen((message) {
      print('WS: $message');
      this.message = WSMessage.fromJson(jsonDecode(message));
      print(
          'WS: ${this.message.event}, ${this.message.matchId}, ${this.message.type}, ${this.message.value}');
      notifyListeners();
    });
  }

  void _send(String message) {
    channel.sink.add(message);
  }

  void send(dynamic message) {
    _send(json.encode(message));
  }

  void subscribeToUser(int userId) {
    send({
      'request': 'user-subscribe',
      'userId': userId,
    });
  }

  @override
  void dispose() {
    channel.sink.close();
    super.dispose();
  }
}
