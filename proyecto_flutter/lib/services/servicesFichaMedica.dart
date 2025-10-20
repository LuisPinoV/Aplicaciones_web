import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://w4h5ev2j02.execute-api.us-east-1.amazonaws.com';

  // Obtener todas las fichas médicas
  static Future<List<dynamic>> getFichas() async {
    final url = Uri.parse('$baseUrl/fichas');
    print('🌐 Llamando a: $url');
    final response = await http.get(url);

    print('📡 Status code: ${response.statusCode}');
    print('📦 Response length: ${response.body.length} caracteres');
    
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      print('🔍 Tipo de respuesta: ${decoded.runtimeType}');
      
      // El API retorna un objeto con la propiedad "data" que contiene el array
      if (decoded is Map && decoded.containsKey('data')) {
        print('✅ Encontrada propiedad data con ${decoded['data'].length} fichas');
        return decoded['data'];
      } else if (decoded is List) {
        print('✅ Es una lista directa con ${decoded.length} elementos');
        return decoded;
      } else if (decoded is Map) {
        print('⚠️ Es un Map sin propiedad data, convirtiéndolo a lista');
        return [decoded];
      }
      return decoded;
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
    print('🔍 Buscando RUT: $rut');
    print('📋 Total de fichas: ${fichas.length}');
    
    try {
      // Buscar coincidencia exacta
      for (var ficha in fichas) {
        final fichaRut = ficha['Rut'];
        print('Comparando con RUT: $fichaRut (tipo: ${fichaRut.runtimeType})');
        
        if (fichaRut == rut || fichaRut.toString() == rut.toString()) {
          print('✅ Ficha encontrada!');
          return ficha;
        }
      }
      
      print('❌ No se encontró ninguna ficha con el RUT: $rut');
      return null;
    } catch (e) {
      print('⚠️ Error en búsqueda: $e');
      return null;
    }
  }
}
