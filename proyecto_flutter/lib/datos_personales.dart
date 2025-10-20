import 'package:flutter/material.dart';
import 'services/servicesFichaMedica.dart';

class DatosPersonalesPage extends StatefulWidget {
  const DatosPersonalesPage({super.key});

  @override
  State<DatosPersonalesPage> createState() => _DatosPersonalesPageState();
}

class _DatosPersonalesPageState extends State<DatosPersonalesPage> {
  late Future<List<dynamic>> _fichasFuture;

  @override
  void initState() {
    super.initState();
    _fichasFuture = ApiService.getFichas();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Datos Personales'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _fichasFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                  const SizedBox(height: 16),
                  Text('Error: ${snapshot.error}'),
                ],
              ),
            );
          }

          final fichas = snapshot.data ?? [];

          if (fichas.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('No hay fichas disponibles.'),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: fichas.length,
            itemBuilder: (context, index) {
              final f = fichas[index];
              final nombre = f['nombre'] ?? 'Sin nombre';
              final rut = f['Rut']?.toString() ?? 'N/A';
              final sexo = f['sexo'] ?? 'N/A';
              final tipoSangre = f['tipoSangre'] ?? 'N/A';
              final altura = f['altura']?.toString() ?? 'N/A';
              final peso = f['peso']?.toString() ?? 'N/A';
              
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header con avatar
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 35,
                            backgroundColor: const Color(0xFF1565C0),
                            child: Text(
                              nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  nombre,
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1565C0),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.badge, size: 16, color: Colors.grey[600]),
                                    const SizedBox(width: 4),
                                    Text(
                                      'RUT: $rut',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[700],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      
                      const Divider(height: 24),
                      
                      // Información personal
                      _buildInfoRow(Icons.person, 'Sexo', sexo),
                      const SizedBox(height: 12),
                      _buildInfoRow(Icons.bloodtype, 'Tipo de Sangre', tipoSangre),
                      const SizedBox(height: 12),
                      _buildInfoRow(Icons.height, 'Altura', '$altura m'),
                      const SizedBox(height: 12),
                      _buildInfoRow(Icons.monitor_weight, 'Peso', '$peso kg'),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.blue[700]),
        const SizedBox(width: 12),
        Text(
          '$label:',
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[800],
            ),
          ),
        ),
      ],
    );
  }
}
