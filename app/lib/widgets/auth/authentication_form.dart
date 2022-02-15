import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wager_app/services/authentication_service.dart';

enum ApplicationLoginState {
  loggedOut,
  emailAddress,
  register,
  password,
  loggedIn,
}

class AuthenticationForm extends StatefulWidget {
  const AuthenticationForm({Key? key}) : super(key: key);

  @override
  _AuthenticationFormState createState() => _AuthenticationFormState();
}

class _AuthenticationFormState extends State<AuthenticationForm> {
  ApplicationLoginState _applicationLoginState =
      ApplicationLoginState.loggedOut;

  String _emailAddress = "";

  void cancel() {
    setState(() {
      _applicationLoginState = ApplicationLoginState.loggedOut;
      _emailAddress = "";
    });
  }

  void handleError(String error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(error),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final User? user = context.watch<User?>();
    final AuthenticationService authenticationService =
        Provider.of<AuthenticationService>(context);

    if (authenticationService.isSignedIn) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Welcome ${user?.displayName}!'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              authenticationService.signOut();
              cancel();
            },
            child: const Text('Logout'),
          ),
        ],
      );
    } else {
      switch (_applicationLoginState) {
        case ApplicationLoginState.loggedOut:
          return Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Please Register/Sign In',
                  style: Theme.of(context).textTheme.headline1),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _applicationLoginState = ApplicationLoginState.emailAddress;
                  });
                },
                child: const Text('Continue'),
              ),
            ],
          );
        case ApplicationLoginState.emailAddress:
          return EmailForm(
            submit: (String email) async {
              try {
                bool knownEmail =
                    await authenticationService.isEmailValid(email);

                setState(() {
                  _applicationLoginState = knownEmail
                      ? ApplicationLoginState.password
                      : ApplicationLoginState.register;
                  _emailAddress = email;
                });
              } catch (e) {
                handleError(e.toString());
              }
            },
            cancel: cancel,
          );
        case ApplicationLoginState.register:
          return RegisterForm(
            submit: (String displayName, String password,
                String passwordConfirm) async {
              try {
                if (password != passwordConfirm) {
                  throw Exception('Passwords do not match.');
                }

                await authenticationService.registerUser(
                    email: _emailAddress,
                    password: password,
                    displayName: displayName);

                setState(() {
                  _applicationLoginState = ApplicationLoginState.password;
                });
              } catch (e) {
                handleError(e.toString());
              }
            },
            cancel: cancel,
          );
        case ApplicationLoginState.password:
          return PasswordForm(
              submit: (String password) async {
                try {
                  await authenticationService.signIn(
                      email: _emailAddress, password: password);

                  setState(() {
                    _applicationLoginState = ApplicationLoginState.loggedIn;
                  });
                } catch (e) {
                  handleError(e.toString());
                }
              },
              cancel: cancel);
        default:
          return Container();
      }
    }
  }
}

class EmailForm extends StatefulWidget {
  const EmailForm({Key? key, required this.submit, required this.cancel})
      : super(key: key);

  final void Function(String email) submit;
  final void Function() cancel;

  @override
  _EmailFormState createState() => _EmailFormState();
}

class _EmailFormState extends State<EmailForm> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          TextField(
            obscureText: false,
            controller: _controller,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Email',
            ),
            onSubmitted: (String value) {
              widget.submit(value);
            },
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () {
                  widget.cancel();
                },
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  widget.submit(_controller.text.trim());
                },
                child: const Text('Next'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PasswordForm extends StatefulWidget {
  const PasswordForm({Key? key, required this.submit, required this.cancel})
      : super(key: key);

  final void Function(String password) submit;
  final void Function() cancel;

  @override
  _PasswordFormState createState() => _PasswordFormState();
}

class _PasswordFormState extends State<PasswordForm> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          TextField(
            obscureText: true,
            controller: _controller,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Password',
            ),
            onSubmitted: (String value) {
              widget.submit(value);
            },
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () {
                  widget.cancel();
                },
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  widget.submit(_controller.text.trim());
                },
                child: const Text('Next'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class RegisterForm extends StatefulWidget {
  const RegisterForm({Key? key, required this.submit, required this.cancel})
      : super(key: key);

  final void Function(
      String displayName, String password, String passwordConfirm) submit;
  final void Function() cancel;

  @override
  _RegisterFormState createState() => _RegisterFormState();
}

class _RegisterFormState extends State<RegisterForm> {
  late TextEditingController _nameController;
  late TextEditingController _passwordController;
  late TextEditingController _passwordConfirmationController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _passwordController = TextEditingController();
    _passwordConfirmationController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _passwordController.dispose();
    _passwordConfirmationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          TextField(
            obscureText: false,
            controller: _nameController,
            autocorrect: false,
            autofillHints: const [AutofillHints.email],
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Name',
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            obscureText: true,
            controller: _passwordController,
            autocorrect: false,
            autofillHints: const [AutofillHints.newPassword],
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Password',
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            obscureText: true,
            controller: _passwordConfirmationController,
            autocorrect: false,
            autofillHints: const [AutofillHints.newPassword],
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Confirm Password',
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () {
                  widget.cancel();
                },
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  widget.submit(
                      _nameController.text.trim(),
                      _passwordController.text.trim(),
                      _passwordConfirmationController.text.trim());
                },
                child: const Text('Register'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
