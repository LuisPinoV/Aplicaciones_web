import 'package:flutter/material.dart';
import 'services/servicesFichaMedica.dart';
import 'busqueda_rut.dart';
import 'buscar_medicamento.dart';
import 'editar_ficha.dart';

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
  final List<dynamic> _fichas = [];
  final ScrollController _scrollController = ScrollController();
  
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentOffset = 0;
  final int _limit = 10;

  @override
  void initState() {
    super.initState();
    _cargarFichas();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent * 0.8) {
      if (!_isLoading && _hasMore) {
        _cargarMasFichas();
      }
    }
  }

  Future<void> _cargarFichas() async {
    setState(() {
      _isLoading = true;
      _fichas.clear();
      _currentOffset = 0;
      _hasMore = true;
    });

    try {
      final resultado = await ApiService.getFichasPaginadas(
        limit: _limit,
        offset: _currentOffset,
      );
      
      if (mounted) {
        setState(() {
          _fichas.addAll(resultado['data']);
          final pagination = resultado['pagination'];
          _hasMore = pagination?['hasMore'] ?? false;
          _currentOffset = pagination?['nextOffset'] ?? 0;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar fichas: $e')),
        );
      }
    }
  }

  Future<void> _cargarMasFichas() async {
    if (_isLoading || !_hasMore) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final resultado = await ApiService.getFichasPaginadas(
        limit: _limit,
        offset: _currentOffset,
      );
      
      if (mounted) {
        setState(() {
          _fichas.addAll(resultado['data']);
          final pagination = resultado['pagination'];
          _hasMore = pagination?['hasMore'] ?? false;
          _currentOffset = pagination?['nextOffset'] ?? 0;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
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
              },
            ),
            ListTile(
              leading: const Icon(Icons.medication, color: Color(0xFF1565C0)),
              title: const Text('Buscar Medicamento (FDA)'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const BuscarMedicamentoPage(),
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
      body: _fichas.isEmpty && _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _fichas.isEmpty && !_isLoading
              ? const Center(child: Text('No hay fichas disponibles.'))
              : RefreshIndicator(
                  onRefresh: _cargarFichas,
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _fichas.length + (_hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _fichas.length) {
                        // Indicador de carga al final
                        return const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }

                      final f = _fichas[index];
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
                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DetalleFichaPage(ficha: ficha),
                                  ),
                                );
                                
                                // Si se eliminó o actualizó la ficha, recargar la lista
                                if (result == true) {
                                  _cargarFichas();
                                }
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
                  ),
                ),
    );
  }
}

/// Página que muestra los detalles de una ficha médica
class DetalleFichaPage extends StatefulWidget {
  final Map<String, dynamic> ficha;

  const DetalleFichaPage({super.key, required this.ficha});

  @override
  State<DetalleFichaPage> createState() => _DetalleFichaPageState();
}

class _DetalleFichaPageState extends State<DetalleFichaPage> {
  late Map<String, dynamic> _fichaActual;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fichaActual = widget.ficha;
  }

  Future<void> _recargarFicha() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final f = _fichaActual['ficha'] ?? _fichaActual;
      final idFicha = f['idFichaMedica'];
      final fichaActualizada = await ApiService.getFicha(idFicha);
      
      if (mounted) {
        setState(() {
          _fichaActual = fichaActualizada;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al recargar: $e')),
        );
      }
    }
  }

  Future<void> _editarFicha() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditarFichaPage(ficha: _fichaActual),
      ),
    );

    // Si se actualizó la ficha, recargar los datos
    if (result == true) {
      await _recargarFicha();
    }
  }

  Future<void> _confirmarEliminar() async {
    final confirmacion = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: const Text('¿Está seguro de que desea eliminar esta ficha médica? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmacion == true) {
      await _eliminarFicha();
    }
  }

  Future<void> _eliminarFicha() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final f = _fichaActual['ficha'] ?? _fichaActual;
      final idFicha = f['idFichaMedica'];
      final success = await ApiService.eliminarFicha(idFicha);

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ficha eliminada correctamente'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Retornar true para indicar que se eliminó
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al eliminar la ficha'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final f = _fichaActual['ficha'] ?? {};
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
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: _isLoading ? null : _editarFicha,
            tooltip: 'Editar ficha',
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: _isLoading ? null : _confirmarEliminar,
            tooltip: 'Eliminar ficha',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
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
