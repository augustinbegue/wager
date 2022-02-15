import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

enum WSEvent {
  MATCH_START,
  MATCH_END,
  MATCH_UPDATE,
}

enum WSEventType {
  HOME_TEAM_SCORE,
  AWAY_TEAM_SCORE,
}

class WSMessage {
  WSEvent event;
  int matchId;
  WSEventType? type;
  int? value;

  WSMessage(
      {required this.event, required this.matchId, this.type, this.value});

  factory WSMessage.fromJson(Map<String, dynamic> json) {
    WSEvent event = WSEvent.MATCH_END;
    switch (json['event']) {
      case 'match_start':
        event = WSEvent.MATCH_START;
        break;
      case 'match_end':
        event = WSEvent.MATCH_END;
        break;
      case 'match_update':
        event = WSEvent.MATCH_UPDATE;
        break;
    }

    WSEventType? type;
    switch (json['type']) {
      case 'home_team_score':
        type = WSEventType.HOME_TEAM_SCORE;
        break;
      case 'away_team_score':
        type = WSEventType.AWAY_TEAM_SCORE;
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
  static const String endpoint = '192.168.1.105';
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
      print(message);
      message = WSMessage.fromJson(jsonDecode(message));
      notifyListeners();
    });
  }

  void _send(String message) {
    channel.sink.add(message);
  }

  void send(Object message) {
    _send(json.encode(message));
  }
}
