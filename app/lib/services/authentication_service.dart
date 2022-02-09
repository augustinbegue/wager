import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class AuthenticationService {
  final FirebaseAuth _firebaseAuth;

  AuthenticationService(this._firebaseAuth);

  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  bool get isSignedIn => _firebaseAuth.currentUser != null;

  Future<bool> isEmailValid(String email) async {
    try {
      List<String> methods =
          await _firebaseAuth.fetchSignInMethodsForEmail(email);

      return methods.contains('password');
    } on FirebaseAuthException catch (e) {
      throw 'This email address is invalid.';
    }
  }

  Future<bool> signIn({required String email, required String password}) async {
    try {
      await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      return true;
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found') {
        throw 'There is no user record corresponding to this identifier. The user may have been deleted.';
      } else if (e.code == 'wrong-password') {
        throw 'The password is invalid.';
      } else if (e.code == 'user-disabled') {
        throw 'This account has been disabled.';
      } else {
        throw 'We have failed to sign you in. Please try again later.';
      }
    }
  }

  Future<bool> registerUser(
      {required String email,
      required String password,
      required String displayName}) async {
    try {
      UserCredential credentials =
          await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await credentials.user?.updateDisplayName(displayName);

      // TODO: Email verification

      return true;
    } on FirebaseAuthException catch (e) {
      if (e.code == 'weak-password') {
        throw 'The password provided is too weak.';
      } else if (e.code == 'email-already-in-use') {
        throw 'The account already exists for that email.';
      } else {
        throw 'An error occurred.';
      }
    } catch (e) {
      if (kDebugMode) {
        print(e);
      }
      throw 'An error occurred.';
    }
  }

  Future<void> signOut() async {
    await _firebaseAuth.signOut();
  }
}
