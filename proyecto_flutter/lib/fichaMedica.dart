import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'services/servicesFichaMedica.dart';

void main() => runApp(const MaterialApp(home: FichasPage()));

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
  socket = IO.io('http://TU_IP_O_DOMINIO:3000', IO.OptionBuilder()
      .setTransports(['websocket'])
      .build());

  socket.onConnect((_) {
    print('Conectado al servidor WebSocket');
  });


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

          return ListView.builder(
            itemCount: fichas.length,
            itemBuilder: (context, index) {
              final f = fichas[index];
              return ListTile(
                title: Text(f['nombre'] ?? 'Sin nombre'),
                subtitle: Text('RUT: ${f['Rut'] ?? 'N/A'}'),
                onTap: () async {
                  final ficha = await ApiService.getFicha(f['idFichaMedica']);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => DetalleFichaPage(ficha: ficha),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

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
        child: Text('Tipo de sangre: ${f['tipoSangre'] ?? 'N/A'}'),
      ),
    );
  }
}
