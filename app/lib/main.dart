import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/ws_api.dart';
import 'package:wager_app/router.gr.dart';
import 'package:wager_app/services/authentication_service.dart';
import 'package:wager_app/utilities/platform_detection.dart';

import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  FirebaseOptions options;

  try {
    options = DefaultFirebaseOptions.currentPlatform;
  } catch (e) {
    options = DefaultFirebaseOptions.web;
  }

  await Firebase.initializeApp(
    options: options,
  );

  runApp(WagerApp());
}

class WagerApp extends StatelessWidget {
  WagerApp({Key? key}) : super(key: key);

  final _appRouter = AppRouter();

  final TextTheme _textTheme = TextTheme(
    headline1: GoogleFonts.ibmPlexSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 48 : 64,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.1,
    ),
    headline2: GoogleFonts.ibmPlexSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 36 : 48,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.1,
    ),
    headline3: GoogleFonts.ibmPlexSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 28 : 40,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.1,
    ),
    headline4: GoogleFonts.ibmPlexSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 24 : 32,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.1,
    ),
    headline5: GoogleFonts.ibmPlexSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 20 : 24,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.1,
    ),
    headline6: GoogleFonts.ibmPlexSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 18 : 20,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.1,
    ),
    bodyText1: GoogleFonts.openSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 16 : 20,
      fontWeight: FontWeight.w400,
    ),
    bodyText2: GoogleFonts.openSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 14 : 16,
      fontWeight: FontWeight.w400,
    ),
    button: GoogleFonts.openSans().copyWith(
      fontSize: PlatformDetection.isMobile() ? 16 : 16,
      fontWeight: FontWeight.w400,
    ),
  );

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final ThemeData _light = ThemeData(
      colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.greenAccent, brightness: Brightness.dark),
      // useMaterial3: true,
    ).copyWith(textTheme: _textTheme);

    final ThemeData _dark = ThemeData(
      colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.greenAccent, brightness: Brightness.dark),
      brightness: Brightness.dark,
      // useMaterial3: true,
    ).copyWith(textTheme: _textTheme);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
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
