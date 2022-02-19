import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/providers/api.dart';
import 'package:wager_app/providers/ws_api.dart';
import 'package:wager_app/services/authentication_service.dart';

import '../../router.gr.dart';

class BalanceWidget extends StatefulWidget {
  const BalanceWidget({Key? key}) : super(key: key);

  @override
  State<BalanceWidget> createState() => _BalanceWidgetState();
}

class _BalanceWidgetState extends State<BalanceWidget> {
  late AuthenticationService authenticationService;
  late WSApi wsApi;
  late ApiUser? currentUser;
  late double balance = 0;

  @override
  void initState() {
    super.initState();
    wsApi = Provider.of<WSApi>(context, listen: false);
    authenticationService =
        Provider.of<AuthenticationService>(context, listen: false);

    // Auth service user changes
    authenticationService.addListener(() {
      setState(() {
        currentUser = authenticationService.currentUser;

        if (currentUser != null) {
          balance = currentUser!.balance;
          wsApi.subscribeToUser(currentUser?.id as int);
        }
      });
    });

    // WSApi balance changes
    wsApi.addListener(() {
      if (wsApi.message.event == WSEvent.BALANCE_UPDATE) {
        setState(() {
          balance += wsApi.message.value.toDouble();
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: Container(), flex: 1),
        Container(
          child: InkWell(
            splashColor:
                Theme.of(context).colorScheme.onPrimary.withOpacity(0.5),
            child: authenticationService.isSignedIn
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(balance.round().toString(),
                          style: Theme.of(context).textTheme.bodyText2),
                      const SizedBox(width: 4),
                      const Icon(Icons.account_balance_wallet, size: 16),
                    ],
                  )
                : Text('Login / Register',
                    style: Theme.of(context).textTheme.bodyText2),
            onTap: () {
              context.pushRoute(const ProfileRoute());
            },
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.all(6),
          margin: const EdgeInsets.fromLTRB(0, 14, 0, 14),
        )
      ],
    );
  }
}
