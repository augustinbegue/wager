import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/live_api.dart';
import 'package:wager_app/router.gr.dart';
import 'package:wager_app/services/authentication_service.dart';

import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(WagerApp());
}

class WagerApp extends StatelessWidget {
  WagerApp({Key? key}) : super(key: key);

  final _appRouter = AppRouter();

  final ThemeData _appTheme = ThemeData(
    useMaterial3: true,
    visualDensity: VisualDensity.adaptivePlatformDensity,
    textTheme: const TextTheme(
      headline1: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.bold,
      ),
      headline2: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.bold,
      ),
      headline3: TextStyle(
        fontSize: 24.0,
        fontWeight: FontWeight.bold,
      ),
      headline4: TextStyle(
        fontSize: 18.0,
        fontWeight: FontWeight.bold,
      ),
      headline5: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.bold,
      ),
      headline6: TextStyle(
        fontSize: 12.0,
        fontWeight: FontWeight.bold,
      ),
      bodyText1: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
      ),
      bodyText2: TextStyle(
        fontSize: 12.0,
        fontWeight: FontWeight.w400,
      ),
      button: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
      ),
    ),
  );

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final ThemeData _light = _appTheme.copyWith(
      colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.greenAccent, brightness: Brightness.light),
      brightness: Brightness.light,
    );

    final ThemeData _dark = _appTheme.copyWith(
      colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.greenAccent, brightness: Brightness.dark),
      brightness: Brightness.dark,
    );

    return MultiProvider(
      providers: [
        Provider<AuthenticationService>(
          create: (_) => AuthenticationService(FirebaseAuth.instance),
        ),
        StreamProvider(
          create: (context) =>
              context.read<AuthenticationService>().authStateChanges,
          initialData: null,
        ),
        ChangeNotifierProvider(
          create: (context) => WSApi(),
        ),
      ],
      child: MaterialApp.router(
        title: 'Wager',
        theme: _light,
        darkTheme: _dark,
        themeMode: ThemeMode.system,
        debugShowCheckedModeBanner: false,
        routerDelegate: _appRouter.delegate(),
        routeInformationParser: _appRouter.defaultRouteParser(),
      ),
    );
  }
}
