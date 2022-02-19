import 'package:flutter/material.dart';

class PulseCircle extends StatefulWidget {
  const PulseCircle({Key? key}) : super(key: key);

  @override
  _PulseCircleState createState() => _PulseCircleState();
}

class _PulseCircleState extends State<PulseCircle>
    with SingleTickerProviderStateMixin {
  late Animation<double> animation;
  late AnimationController controller;

  @override
  void initState() {
    super.initState();

    controller = AnimationController(
        duration: const Duration(milliseconds: 1000), vsync: this);
    animation = Tween<double>(begin: 0.1, end: 1.0).animate(controller)
      ..addListener(() {
        setState(() {});
      });

    controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: animation.value,
      child: Container(
        height: 6,
        width: 6,
        decoration: BoxDecoration(
          color: Colors.red,
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}
