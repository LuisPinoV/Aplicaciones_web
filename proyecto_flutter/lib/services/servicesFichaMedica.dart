import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://w4h5ev2j02.execute-api.us-east-1.amazonaws.com/';

  // Obtener todas las fichas médicas
  static Future<List<dynamic>> getFichas() async {
    final url = Uri.parse('$baseUrl/fichas');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener fichas médicas: ${response.statusCode}');
    }
  }

  // Obtener una ficha específica por ID
  static Future<Map<String, dynamic>> getFicha(int id) async {
    final url = Uri.parse('$baseUrl/fichas/$id');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener ficha: ${response.statusCode}');
    }
  }

  // Insertar una ficha médica nueva
  static Future<bool> crearFicha(Map<String, dynamic> ficha) async {
    final url = Uri.parse('$baseUrl/fichas');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(ficha),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }
}
