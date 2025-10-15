import 'package:flutter/material.dart';
import 'services/servicesFichaMedica.dart';

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
      appBar: AppBar(title: const Text('Fichas Médicas')),
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
            itemCount: fichas.length,
            itemBuilder: (context, index) {
              final f = fichas[index];
              return ListTile(
                title: Text(f['nombre'] ?? 'Sin nombre'),
                subtitle: Text('RUT: ${f['Rut'] ?? 'N/A'}'),
                trailing: const Icon(Icons.chevron_right),
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

    return Scaffold(
      appBar: AppBar(title: Text(f['nombre'] ?? 'Detalle de ficha')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('RUT: ${f['Rut'] ?? 'N/A'}'),
            Text('Tipo de sangre: ${f['tipoSangre'] ?? 'N/A'}'),
            Text('Sexo: ${f['sexo'] ?? 'N/A'}'),
            Text('Altura: ${f['altura'] ?? 'N/A'} cm'),
            Text('Peso: ${f['peso'] ?? 'N/A'} kg'),
          ],
        ),
      ),
    );
  }
}
