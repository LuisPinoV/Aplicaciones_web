import 'package:dio/dio.dart';
import 'dio_client.dart';

class OpenFDAService {
  final String baseUrl = 'https://api.fda.gov/drug';
  final DioClient _dioClient = DioClient();

  /// Buscar medicamentos por nombre
  Future<List<Map<String, dynamic>>> buscarMedicamentos(String query) async {
    if (query.isEmpty) return [];
    
    try {
      print('🔍 Buscando medicamentos: "$query"');
      
      final response = await _dioClient.get(
        '$baseUrl/label.json',
        queryParameters: {
          'search': 'openfda.brand_name:"$query"*',
          'limit': 10,
        },
      );
      
      if (response.statusCode == 200 && response.data['results'] != null) {
        final results = List<Map<String, dynamic>>.from(response.data['results']);
        print('✅ Encontrados ${results.length} medicamentos');
        return results;
      }
      
      return [];
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        print('⚠️ No se encontraron medicamentos');
        return [];
      }
      print('❌ Error buscando medicamentos: ${e.message}');
      rethrow;
    }
  }

  /// Obtener información detallada de un medicamento
  Future<Map<String, dynamic>?> obtenerDetallesMedicamento(String nombre) async {
    try {
      final response = await _dioClient.get(
        '$baseUrl/label.json',
        queryParameters: {
          'search': 'openfda.brand_name:"$nombre"',
          'limit': 1,
        },
      );
      
      if (response.statusCode == 200 && 
          response.data['results'] != null && 
          response.data['results'].length > 0) {
        return response.data['results'][0];
      }
      
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      print('❌ Error obteniendo detalles: ${e.message}');
      rethrow;
    }
  }

  /// Obtener efectos adversos de un medicamento
  Future<List<String>> obtenerEfectosAdversos(String nombre) async {
    try {
      final detalles = await obtenerDetallesMedicamento(nombre);
      
      if (detalles != null) {
        List<String> efectos = [];
        
        if (detalles['adverse_reactions'] != null) {
          efectos.addAll(List<String>.from(detalles['adverse_reactions']));
        }
        
        if (detalles['warnings'] != null) {
          efectos.addAll(List<String>.from(detalles['warnings']));
        }
        
        if (detalles['precautions'] != null) {
          efectos.addAll(List<String>.from(detalles['precautions']));
        }
        
        return efectos;
      }
      return [];
    } catch (e) {
      print('❌ Error obteniendo efectos adversos: $e');
      return [];
    }
  }

  /// Verificar recalls activos
  Future<List<Map<String, dynamic>>> verificarRecalls(String nombre) async {
    try {
      final response = await _dioClient.get(
        '$baseUrl/enforcement.json',
        queryParameters: {
          'search': 'product_description:"$nombre"',
          'limit': 5,
        },
      );
      
      if (response.statusCode == 200 && response.data['results'] != null) {
        return List<Map<String, dynamic>>.from(response.data['results']);
      }
      
      return [];
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      print('❌ Error verificando recalls: ${e.message}');
      return [];
    }
  }

  /// Extraer información básica de un medicamento
  Map<String, String> extraerInfoBasica(Map<String, dynamic> medicamento) {
    final openfda = medicamento['openfda'] ?? {};
    
    return {
      'nombreComercial': openfda['brand_name']?.first ?? 'N/A',
      'nombreGenerico': openfda['generic_name']?.first ?? 'N/A',
      'fabricante': openfda['manufacturer_name']?.first ?? 'N/A',
      'ruta': openfda['route']?.first ?? 'N/A',
      'forma': openfda['dosage_form']?.first ?? 'N/A',
    };
  }
}