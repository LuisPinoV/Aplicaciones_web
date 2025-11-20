import 'package:flutter/material.dart';
import '/services/apidog.dart';

void main() {
  runApp(const MaterialApp(
    debugShowCheckedModeBanner: false,
    home: getHttp(),
  ));
}
