import 'package:flutter/material.dart';
import 'services/servicesFichaMedica.dart';
import 'busqueda_rut.dart';
import 'datos_personales.dart';
import 'consulta_inicial.dart';

/// 🔹 Punto de entrada del programa
void main() {
  runApp(const MaterialApp(
    debugShowCheckedModeBanner: false,
    home: FichasPage(),
  ));
}

/// Página principal que lista las fichas médicas
class FichasPage extends StatefulWidget {
  const FichasPage({super.key});

  @override
  State<FichasPage> createState() => _FichasPageState();
}

class _FichasPageState extends State<FichasPage> {
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
        title: const Text('Fichas Médicas'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(
                color: Color(0xFF1565C0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Icon(
                    Icons.local_hospital,
                    size: 48,
                    color: Colors.white,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Sistema Médico',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.person, color: Color(0xFF1565C0)),
              title: const Text('Datos Personales'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const DatosPersonalesPage(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.search, color: Color(0xFF1565C0)),
              title: const Text('Búsqueda por RUT'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const BusquedaRutPage(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.medical_services, color: Color(0xFF1565C0)),
              title: const Text('Consulta Inicial'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ConsultaInicialPage(),
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.info_outline, color: Colors.grey),
              title: const Text('Acerca de'),
              onTap: () {
                Navigator.pop(context);
                showAboutDialog(
                  context: context,
                  applicationName: 'Sistema Médico',
                  applicationVersion: '1.0.0',
                  applicationIcon: const Icon(Icons.local_hospital),
                );
              },
            ),
          ],
        ),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _fichasFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final fichas = snapshot.data ?? [];

          if (fichas.isEmpty) {
            return const Center(child: Text('No hay fichas disponibles.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: fichas.length,
            itemBuilder: (context, index) {
              final f = fichas[index];
              final nombre = f['nombre'] ?? 'Sin nombre';
              final rut = f['Rut']?.toString() ?? 'N/A';
              
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: BorderSide(color: Colors.blue[100]!, width: 1),
                ),
                child: InkWell(
                  onTap: () async {
                    try {
                      final ficha = await ApiService.getFicha(f['idFichaMedica']);
                      if (context.mounted) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => DetalleFichaPage(ficha: ficha),
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error al cargar ficha: $e')),
                        );
                      }
                    }
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: const Color(0xFF1565C0),
                          child: Text(
                            nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                            style: const TextStyle(
                              fontSize: 24,
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
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1565C0),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.badge, size: 14, color: Colors.grey[600]),
                                  const SizedBox(width: 4),
                                  Text(
                                    'RUT: $rut',
                                    style: TextStyle(
                                      color: Colors.grey[700],
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.chevron_right, color: Colors.grey[400]),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

/// Página que muestra los detalles de una ficha médica
class DetalleFichaPage extends StatelessWidget {
  final Map<String, dynamic> ficha;

  const DetalleFichaPage({super.key, required this.ficha});

  @override
  Widget build(BuildContext context) {
    final f = ficha['ficha'] ?? {};
    final nombre = f['nombre'] ?? 'Sin nombre';
    final rut = f['Rut']?.toString() ?? 'N/A';
    final tipoSangre = f['tipoSangre'] ?? 'N/A';
    final sexo = f['sexo'] ?? 'N/A';
    final altura = f['altura']?.toString() ?? 'N/A';
    final peso = f['peso']?.toString() ?? 'N/A';
    final fechaNacimiento = f['fechaNacimiento'] ?? 'N/A';
    final genero = f['genero'] ?? 'N/A';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Ficha'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.blue[50],
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: const Color(0xFF1565C0),
                    child: Text(
                      nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    nombre,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'RUT: $rut',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[700],
                    ),
                  ),
                ],
              ),
            ),
            // Detalles
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildInfoCard(
                    context,
                    'Información Personal',
                    [
                      _buildInfoRow(Icons.cake, 'Fecha de Nacimiento', fechaNacimiento),
                      _buildInfoRow(Icons.person, 'Sexo', sexo),
                      _buildInfoRow(Icons.wc, 'Género', genero),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildInfoCard(
                    context,
                    'Información Médica',
                    [
                      _buildInfoRow(Icons.bloodtype, 'Tipo de Sangre', tipoSangre),
                      _buildInfoRow(Icons.height, 'Altura', '$altura m'),
                      _buildInfoRow(Icons.monitor_weight, 'Peso', '$peso kg'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, String title, List<Widget> children) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: Colors.blue[100]!, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1565C0),
              ),
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
