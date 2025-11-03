import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'services/servicesFichaMedica.dart';
import 'editar_ficha.dart';

class BusquedaRutPage extends StatefulWidget {
  const BusquedaRutPage({super.key});

  @override
  State<BusquedaRutPage> createState() => _BusquedaRutPageState();
}

class _BusquedaRutPageState extends State<BusquedaRutPage> {
  final TextEditingController _rutController = TextEditingController();
  
  bool _isSearching = false;
  Map<String, dynamic>? _fichaEncontrada;
  String? _errorMessage;

  @override
  void dispose() {
    _rutController.dispose();
    super.dispose();
  }

  Future<void> _buscarPorRut() async {
    final rutText = _rutController.text.trim();
    
    if (rutText.isEmpty) {
      setState(() {
        _errorMessage = 'Por favor ingrese un RUT';
        _fichaEncontrada = null;
      });
      return;
    }

    final rut = int.tryParse(rutText);
    if (rut == null) {
      setState(() {
        _errorMessage = 'RUT inválido. Solo ingrese números.';
        _fichaEncontrada = null;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _errorMessage = null;
      _fichaEncontrada = null;
    });

    try {
      final ficha = await ApiService.getFichaByRut(rut);
      
      setState(() {
        _isSearching = false;
        if (ficha != null) {
          _fichaEncontrada = ficha;
          _errorMessage = null;
        } else {
          _fichaEncontrada = null;
          _errorMessage = 'No se encontró ninguna ficha con el RUT: $rut';
        }
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
        _errorMessage = 'Error al buscar: $e';
        _fichaEncontrada = null;
      });
    }
  }

  void _editarFicha() {
    if (_fichaEncontrada == null) return;
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditarFichaPage(ficha: _fichaEncontrada!),
      ),
    ).then((actualizado) {
      if (actualizado == true) {
        // Actualizar la búsqueda para mostrar los datos actualizados
        _buscarPorRut();
      }
    });
  }

  void _confirmarEliminar() {
    if (_fichaEncontrada == null) return;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirmar eliminación'),
          content: Text(
            '¿Está seguro de eliminar la ficha médica de ${_fichaEncontrada!['nombre']}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _eliminarFicha();
              },
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _eliminarFicha() async {
    if (_fichaEncontrada == null) return;

    final fichaId = _fichaEncontrada!['id'];
    
    try {
      // Mostrar indicador de carga
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        },
      );

      await ApiService.eliminarFicha(fichaId);

      if (!mounted) return;
      
      // Cerrar el indicador de carga
      Navigator.of(context).pop();
      
      // Limpiar la búsqueda
      setState(() {
        _fichaEncontrada = null;
        _errorMessage = null;
        _rutController.clear();
      });

      // Mostrar mensaje de éxito
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ficha médica eliminada exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      
      // Cerrar el indicador de carga
      Navigator.of(context).pop();
      
      // Mostrar mensaje de error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al eliminar: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Búsqueda por RUT'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Icono de búsqueda
              Icon(
                Icons.search,
                size: 80,
                color: Colors.blue[700],
              ),
              const SizedBox(height: 24),
              
              // Título
              Text(
                'Buscar Ficha Médica',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[900],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Ingrese el RUT del paciente',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // Campo de búsqueda
              TextField(
                controller: _rutController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                ],
                decoration: InputDecoration(
                  labelText: 'RUT',
                  hintText: 'Ej: 12345678',
                  prefixIcon: const Icon(Icons.badge),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.blue[300]!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
                  ),
                ),
                onSubmitted: (_) => _buscarPorRut(),
              ),
              const SizedBox(height: 24),
              
              // Botón de búsqueda
              ElevatedButton.icon(
                onPressed: _isSearching ? null : _buscarPorRut,
                icon: _isSearching
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Icon(Icons.search),
                label: Text(_isSearching ? 'Buscando...' : 'Buscar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1565C0),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // Mensaje de error
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    border: Border.all(color: Colors.red[300]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red[700]),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(color: Colors.red[700]),
                        ),
                      ),
                    ],
                  ),
                ),
              
              // Resultado de la búsqueda
              if (_fichaEncontrada != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    border: Border.all(color: Colors.green[300]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green[700]),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              '¡Ficha encontrada!',
                              style: TextStyle(
                                color: Colors.green[700],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildResultCard(),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard() {
    if (_fichaEncontrada == null) return const SizedBox.shrink();

    final nombre = _fichaEncontrada!['nombre'] ?? 'Sin nombre';
    final rut = _fichaEncontrada!['Rut']?.toString() ?? 'Sin RUT';
    final fechaNacimiento = _fichaEncontrada!['fechaNacimiento'] ?? 'Sin fecha';
    final tipoSangre = _fichaEncontrada!['tipoSangre'] ?? 'Sin tipo';

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => FichaDetallePage(ficha: _fichaEncontrada!),
            ),
          );
        },
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: const Color(0xFF1565C0),
                child: Text(
                  nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                nombre,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              _buildInfoRow(Icons.badge, 'RUT', rut),
              _buildInfoRow(Icons.calendar_today, 'F. Nacimiento', fechaNacimiento),
              _buildInfoRow(Icons.bloodtype, 'Tipo Sangre', tipoSangre),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => FichaDetallePage(ficha: _fichaEncontrada!),
                        ),
                      );
                    },
                    icon: const Icon(Icons.visibility),
                    label: const Text('Ver Detalles'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1565C0),
                      foregroundColor: Colors.white,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _editarFicha(),
                    icon: const Icon(Icons.edit),
                    label: const Text('Editar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange,
                      foregroundColor: Colors.white,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _confirmarEliminar(),
                    icon: const Icon(Icons.delete),
                    label: const Text('Eliminar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Página de detalles de la ficha
class FichaDetallePage extends StatelessWidget {
  final Map<String, dynamic> ficha;

  const FichaDetallePage({super.key, required this.ficha});

  @override
  Widget build(BuildContext context) {
    final nombre = ficha['nombre'] ?? 'Sin nombre';
    final rut = ficha['Rut']?.toString() ?? 'Sin RUT';
    final fechaNacimiento = ficha['fechaNacimiento'] ?? 'Sin fecha';
    final sexo = ficha['sexo'] ?? 'Sin especificar';
    final tipoSangre = ficha['tipoSangre'] ?? 'Sin tipo';
    final altura = ficha['altura']?.toString() ?? 'Sin altura';
    final peso = ficha['peso']?.toString() ?? 'Sin peso';
    final genero = ficha['genero'] ?? 'Sin especificar';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Ficha Médica'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header con información principal
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
                      _buildDetailRow(Icons.cake, 'Fecha de Nacimiento', fechaNacimiento),
                      _buildDetailRow(Icons.person, 'Sexo', sexo),
                      _buildDetailRow(Icons.wc, 'Género', genero),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildInfoCard(
                    context,
                    'Información Médica',
                    [
                      _buildDetailRow(Icons.bloodtype, 'Tipo de Sangre', tipoSangre),
                      _buildDetailRow(Icons.height, 'Altura', '$altura m'),
                      _buildDetailRow(Icons.monitor_weight, 'Peso', '$peso kg'),
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

  Widget _buildDetailRow(IconData icon, String label, String value) {
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
