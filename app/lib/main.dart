import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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

  final lightTheme = ColorScheme.fromSeed(seedColor: Colors.blue);
  final darkTheme =
      ColorScheme.fromSeed(seedColor: Colors.blue, brightness: Brightness.dark);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AuthenticationService>(
          create: (_) => AuthenticationService(FirebaseAuth.instance),
        ),
        StreamProvider(
          create: (context) =>
              context.read<AuthenticationService>().authStateChanges,
          initialData: null,
        )
      ],
      child: MaterialApp(
        title: 'Wager',
        theme: ThemeData(
          colorScheme: lightTheme,
          useMaterial3: true,
        ),
        darkTheme: ThemeData(
          colorScheme: darkTheme,
          useMaterial3: true,
        ),
        themeMode: ThemeMode.system,
        debugShowCheckedModeBanner: false,
        home: MaterialApp.router(
          routerDelegate: _appRouter.delegate(),
          routeInformationParser: _appRouter.defaultRouteParser(),
        ),
      ),
    );
  }
}
