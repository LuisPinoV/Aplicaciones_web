import 'package:dio/dio.dart';

class DioClient {
  static Dio build() {
    return Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Accept': 'application/json'},
    ));
  }
}

class DogApiService {
  final Dio _dio;

  DogApiService([Dio? dio]) : _dio = dio ?? DioClient.build();

  Future<Map<String, List<String>>> getBreeds() async {
    final resp = await _dio.get('https://dog.ceo/api/breeds/list/all');
    final data = resp.data;
    if (data == null || data['status'] != 'success') {
      throw Exception('API error fetching breeds');
    }

    final message = data['message'] as Map<String, dynamic>;
    final Map<String, List<String>> breeds = {};
    message.forEach((key, value) {
      breeds[key] = List<String>.from(value as List<dynamic>);
    });
    return breeds;
  }

  Future<String?> getRandomImage(String breed) async {
    final resp = await _dio.get('https://dog.ceo/api/breed/$breed/images/random');
    final data = resp.data;
    if (data == null || data['status'] != 'success') {
      throw Exception('API error fetching image');
    }
    return data['message'] as String?;
  }
}