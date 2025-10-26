import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://w4h5ev2j02.execute-api.us-east-1.amazonaws.com/';

  // Obtener todas las fichas médicas (sin paginación)
  static Future<List<dynamic>> getFichas() async {
    final url = Uri.parse('$baseUrl/fichas');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final jsonData = jsonDecode(response.body);
      // La API devuelve un objeto con 'data' y 'pagination'
      return jsonData['data'] ?? [];
    } else {
      throw Exception('Error al obtener fichas médicas: ${response.statusCode}');
    }
  }

  // Obtener fichas médicas con paginación
  static Future<Map<String, dynamic>> getFichasPaginadas({
    required int limit,
    required int offset,
  }) async {
    final url = Uri.parse('$baseUrl/fichas?limit=$limit&offset=$offset');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final jsonData = jsonDecode(response.body);
      return {
        'data': jsonData['data'] ?? [],
        'pagination': jsonData['pagination'],
      };
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

  // NUEVO: Buscar ficha por RUT
  static Future<Map<String, dynamic>?> getFichaByRut(int rut) async {
    final fichas = await getFichas();
    try {
      final ficha = fichas.firstWhere((ficha) => ficha['Rut'] == rut);
      return ficha as Map<String, dynamic>;
    } catch (e) {
      return null; // No se encontró ninguna ficha con ese RUT
    }
  }

  // Actualizar una ficha médica existente
  static Future<bool> actualizarFicha(int id, Map<String, dynamic> ficha) async {
    final url = Uri.parse('$baseUrl/fichas/$id');
    try {
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(ficha),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        print('Error al actualizar: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error en actualizarFicha: $e');
      return false;
    }
  }

  // Eliminar una ficha médica
  static Future<bool> eliminarFicha(int id) async {
    final url = Uri.parse('$baseUrl/fichas/$id');
    try {
      final response = await http.delete(url);

      if (response.statusCode == 200) {
        return true;
      } else {
        print('Error al eliminar: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error en eliminarFicha: $e');
      return false;
    }
  }
}
