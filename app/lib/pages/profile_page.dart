import 'package:flutter/material.dart';
import '../../widgets/auth/authentication_form.dart';

// new
class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: AuthenticationForm(),
      ),
    );
  }
}
