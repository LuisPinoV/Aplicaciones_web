import 'package:flutter/material.dart';
import 'services/openfda_service.dart';

class BuscarMedicamentoPage extends StatefulWidget {
  const BuscarMedicamentoPage({super.key});

  @override
  State<BuscarMedicamentoPage> createState() => _BuscarMedicamentoPageState();
}

class _BuscarMedicamentoPageState extends State<BuscarMedicamentoPage> {
  final TextEditingController _searchController = TextEditingController();
  final OpenFDAService _fdaService = OpenFDAService();
  
  List<Map<String, dynamic>> _resultados = [];
  bool _isSearching = false;
  String? _errorMessage;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _buscarMedicamento() async {
    final query = _searchController.text.trim();
    
    if (query.isEmpty) {
      setState(() {
        _errorMessage = 'Por favor ingrese un nombre de medicamento';
        _resultados = [];
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _errorMessage = null;
    });

    try {
      final resultados = await _fdaService.buscarMedicamentos(query);
      
      setState(() {
        _resultados = resultados;
        _isSearching = false;
        if (resultados.isEmpty) {
          _errorMessage = 'No se encontraron medicamentos con ese nombre';
        }
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
        _errorMessage = 'Error al buscar: $e';
        _resultados = [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Buscar Medicamento'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Ej: Aspirin, Tylenol, Ibuprofen...',
                      prefixIcon: const Icon(Icons.medication),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    onSubmitted: (_) => _buscarMedicamento(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isSearching ? null : _buscarMedicamento,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(16),
                  ),
                  child: _isSearching
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Icon(Icons.search),
                ),
              ],
            ),
          ),

          // Mensaje de error
          if (_errorMessage != null)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange[50],
                border: Border.all(color: Colors.orange[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.orange[700]),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(color: Colors.orange[700]),
                    ),
                  ),
                ],
              ),
            ),

          // Lista de resultados
          Expanded(
            child: _resultados.isEmpty && !_isSearching
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.medication_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Busca información de medicamentos',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Base de datos de la FDA (USA)',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _resultados.length,
                    itemBuilder: (context, index) {
                      final medicamento = _resultados[index];
                      final info = _fdaService.extraerInfoBasica(medicamento);
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(color: Colors.blue[100]!, width: 1),
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: const Color(0xFF1565C0),
                            child: const Icon(
                              Icons.medication,
                              color: Colors.white,
                            ),
                          ),
                          title: Text(
                            info['nombreComercial']!,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1565C0),
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text('Genérico: ${info['nombreGenerico']}'),
                              Text('Forma: ${info['forma']}'),
                              Text('Fabricante: ${info['fabricante']}'),
                            ],
                          ),
                          isThreeLine: true,
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            _mostrarDetalles(medicamento, info);
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _mostrarDetalles(Map<String, dynamic> medicamento, Map<String, String> info) async {
    // Mostrar diálogo de carga
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    // Obtener efectos adversos
    final efectos = await _fdaService.obtenerEfectosAdversos(info['nombreComercial']!);
    
    if (!mounted) return;
    
    // Cerrar diálogo de carga
    Navigator.pop(context);
    
    // Mostrar detalles
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          info['nombreComercial']!,
          style: const TextStyle(color: Color(0xFF1565C0)),
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildInfoRow('Nombre Genérico', info['nombreGenerico']!),
              _buildInfoRow('Forma', info['forma']!),
              _buildInfoRow('Vía', info['ruta']!),
              _buildInfoRow('Fabricante', info['fabricante']!),
              
              if (efectos.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Text(
                  '⚠️ Efectos Adversos:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                ...efectos.take(3).map((efecto) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    '• ${efecto.length > 150 ? '${efecto.substring(0, 150)}...' : efecto}',
                    style: TextStyle(color: Colors.grey[700]),
                  ),
                )),
                if (efectos.length > 3)
                  Text(
                    '...y ${efectos.length - 3} más',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
              ] else ...[
                const SizedBox(height: 16),
                Text(
                  'No se encontraron efectos adversos registrados.',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}