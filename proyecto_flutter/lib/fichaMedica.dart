import 'dart:async';
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
  final TextEditingController _searchController = TextEditingController();
  
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentOffset = 0;
  final int _limit = 10;
  String _searchQuery = '';
  
  // Filtros y ordenamiento
  String _ordenamiento = 'recientes'; // recientes, antiguos, az, za
  String? _filtroGenero; // null, Masculino, Femenino, Otro
  String? _filtroTipoSangre; // null, A+, A-, B+, B-, AB+, AB-, O+, O-
  
  // Timer para debounce de búsqueda
  Timer? _debounceTimer;
  
  List<dynamic> get _fichasFiltradas {
    List<dynamic> resultado = List.from(_fichas);
    
    // Aplicar búsqueda por nombre (del lado del cliente)
    if (_searchQuery.isNotEmpty) {
      resultado = resultado.where((ficha) {
        final nombre = (ficha['nombre'] ?? '').toString().toLowerCase();
        final query = _searchQuery.toLowerCase().trim();
        return nombre.contains(query);
      }).toList();
    }
    
    // Aplicar filtro de género
    if (_filtroGenero != null) {
      resultado = resultado.where((ficha) {
        return ficha['sexo'] == _filtroGenero;
      }).toList();
    }
    
    // Aplicar filtro de tipo de sangre
    if (_filtroTipoSangre != null) {
      resultado = resultado.where((ficha) {
        return ficha['tipoSangre'] == _filtroTipoSangre;
      }).toList();
    }
    
    // Aplicar ordenamiento
    resultado.sort((a, b) {
      switch (_ordenamiento) {
        case 'antiguos':
          // Más antiguos primero (asumiendo que ID menor = más antiguo)
          final idA = a['idFichaMedica'] ?? 0;
          final idB = b['idFichaMedica'] ?? 0;
          return idA.compareTo(idB);
        case 'recientes':
          // Más recientes primero
          final idA = a['idFichaMedica'] ?? 0;
          final idB = b['idFichaMedica'] ?? 0;
          return idB.compareTo(idA);
        case 'az':
          // A-Z alfabético
          final nombreA = (a['nombre'] ?? '').toString().toLowerCase();
          final nombreB = (b['nombre'] ?? '').toString().toLowerCase();
          return nombreA.compareTo(nombreB);
        case 'za':
          // Z-A alfabético inverso
          final nombreA = (a['nombre'] ?? '').toString().toLowerCase();
          final nombreB = (b['nombre'] ?? '').toString().toLowerCase();
          return nombreB.compareTo(nombreA);
        default:
          return 0;
      }
    });
    
    return resultado;
  }
  
  bool get _tienesFiltrosActivos {
    return _filtroGenero != null || _filtroTipoSangre != null || _ordenamiento != 'recientes';
  }

  @override
  void initState() {
    super.initState();
    _cargarFichas();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent * 0.8) {
      if (!_isLoading && _hasMore && _searchQuery.isEmpty) {
        _cargarMasFichas();
      }
    }
  }

  // Método para manejar el cambio de búsqueda con debounce
  void _onSearchChanged(String value) {
    // Cancelar el timer anterior si existe
    _debounceTimer?.cancel();
    
    // Crear un nuevo timer que espera 500ms antes de buscar
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      if (value.trim() != _searchQuery) {
        setState(() {
          _searchQuery = value.trim();
        });
        // Si hay búsqueda, cargar todas las fichas, sino paginación normal
        if (_searchQuery.isNotEmpty) {
          _cargarTodasLasFichas();
        } else {
          _cargarFichas();
        }
      }
    });
  }

  Future<void> _cargarTodasLasFichas() async {
    setState(() {
      _isLoading = true;
      _fichas.clear();
    });

    try {
      // Cargar todas las fichas sin paginación
      final todasLasFichas = await ApiService.getFichas();
      
      if (mounted) {
        setState(() {
          _fichas.addAll(todasLasFichas);
          _hasMore = false; // No hay más para cargar
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al buscar: $e')),
        );
      }
    }
  }

  void _mostrarFiltros() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (BuildContext context, StateSetter setModalState) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Handle del modal
                  Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 8),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  // Título
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Filtros y Ordenamiento',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1565C0),
                          ),
                        ),
                        if (_tienesFiltrosActivos)
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _ordenamiento = 'recientes';
                                _filtroGenero = null;
                                _filtroTipoSangre = null;
                              });
                              setModalState(() {}); // Actualizar el modal
                            },
                            child: const Text('Limpiar todo'),
                          ),
                      ],
                    ),
                  ),
                  // Ordenamiento
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Ordenar por',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          children: [
                            _buildFilterChip(
                              label: 'Más recientes',
                              selected: _ordenamiento == 'recientes',
                              onSelected: (selected) {
                                setState(() {
                                  _ordenamiento = 'recientes';
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            _buildFilterChip(
                              label: 'Más antiguos',
                              selected: _ordenamiento == 'antiguos',
                              onSelected: (selected) {
                                setState(() {
                                  _ordenamiento = 'antiguos';
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            _buildFilterChip(
                              label: 'A - Z',
                              selected: _ordenamiento == 'az',
                              onSelected: (selected) {
                                setState(() {
                                  _ordenamiento = 'az';
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            _buildFilterChip(
                              label: 'Z - A',
                              selected: _ordenamiento == 'za',
                              onSelected: (selected) {
                                setState(() {
                                  _ordenamiento = 'za';
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Filtro por género
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Filtrar por género',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          children: [
                            _buildFilterChip(
                              label: 'Todos',
                              selected: _filtroGenero == null,
                              onSelected: (selected) {
                                setState(() {
                                  _filtroGenero = null;
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            _buildFilterChip(
                              label: 'Masculino',
                              icon: Icons.male,
                              selected: _filtroGenero == 'Masculino',
                              onSelected: (selected) {
                                setState(() {
                                  _filtroGenero = selected ? 'Masculino' : null;
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            _buildFilterChip(
                              label: 'Femenino',
                              icon: Icons.female,
                              selected: _filtroGenero == 'Femenino',
                              onSelected: (selected) {
                                setState(() {
                                  _filtroGenero = selected ? 'Femenino' : null;
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            _buildFilterChip(
                              label: 'Otro',
                              icon: Icons.transgender,
                              selected: _filtroGenero == 'Otro',
                              onSelected: (selected) {
                                setState(() {
                                  _filtroGenero = selected ? 'Otro' : null;
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Filtro por tipo de sangre
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Filtrar por tipo de sangre',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildFilterChip(
                              label: 'Todos',
                              selected: _filtroTipoSangre == null,
                              onSelected: (selected) {
                                setState(() {
                                  _filtroTipoSangre = null;
                                });
                                setModalState(() {}); // Actualizar el modal
                              },
                            ),
                            ..._buildTipoSangreChips(setModalState),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Botón de aplicar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1565C0),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Aplicar filtros',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    IconData? icon,
    required bool selected,
    required Function(bool) onSelected,
  }) {
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 16, color: selected ? Colors.white : const Color(0xFF1565C0)),
            const SizedBox(width: 4),
          ],
          Text(label),
        ],
      ),
      selected: selected,
      onSelected: onSelected,
      selectedColor: const Color(0xFF1565C0),
      checkmarkColor: Colors.white,
      backgroundColor: Colors.grey[200],
      labelStyle: TextStyle(
        color: selected ? Colors.white : Colors.black87,
        fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: selected ? const Color(0xFF1565C0) : Colors.grey[300]!,
          width: 1,
        ),
      ),
    );
  }

  List<Widget> _buildTipoSangreChips(StateSetter setModalState) {
    final tipos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return tipos.map((tipo) {
      return _buildFilterChip(
        label: tipo,
        icon: Icons.bloodtype,
        selected: _filtroTipoSangre == tipo,
        onSelected: (selected) {
          setState(() {
            _filtroTipoSangre = selected ? tipo : null;
          });
          setModalState(() {}); // Actualizar el modal
        },
      );
    }).toList();
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

  Widget _buildQuickAccessCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [color.withOpacity(0.8), color],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: Colors.white),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fichas Médicas'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        elevation: 0,
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
      body: Column(
        children: [
          // Header con fondo degradado
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Column(
              children: [
                // Buscador
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Buscar por nombre...',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                      prefixIcon: const Icon(Icons.search, color: Colors.white),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: Colors.white),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {
                                  _searchQuery = '';
                                });
                                _cargarFichas();
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.2),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
                ),
                // Accesos Rápidos
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Accesos Rápidos',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 100,
                        child: Row(
                          children: [
                            Expanded(
                              child: _buildQuickAccessCard(
                                icon: Icons.search,
                                title: 'Buscar por RUT',
                                color: const Color(0xFF00897B),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const BusquedaRutPage(),
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildQuickAccessCard(
                                icon: Icons.medication,
                                title: 'Medicamentos FDA',
                                color: const Color(0xFFD32F2F),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const BuscarMedicamentoPage(),
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildQuickAccessCard(
                                icon: Icons.refresh,
                                title: 'Actualizar',
                                color: const Color(0xFFF57C00),
                                onTap: _cargarFichas,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Contador de resultados
          if (_fichasFiltradas.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.folder_open, size: 20, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Text(
                    '${_fichasFiltradas.length} ficha${_fichasFiltradas.length != 1 ? 's' : ''} encontrada${_fichasFiltradas.length != 1 ? 's' : ''}',
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          // Chips de filtros activos
          if (_tienesFiltrosActivos)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (_ordenamiento != 'recientes')
                    Chip(
                      label: Text(
                        _ordenamiento == 'antiguos' ? 'Más antiguos' :
                        _ordenamiento == 'az' ? 'A - Z' : 'Z - A',
                        style: const TextStyle(fontSize: 12),
                      ),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () {
                        setState(() {
                          _ordenamiento = 'recientes';
                        });
                      },
                      backgroundColor: Colors.blue[50],
                      side: BorderSide(color: Colors.blue[200]!),
                    ),
                  if (_filtroGenero != null)
                    Chip(
                      avatar: Icon(
                        _filtroGenero == 'Masculino' ? Icons.male :
                        _filtroGenero == 'Femenino' ? Icons.female : Icons.transgender,
                        size: 16,
                        color: const Color(0xFF1565C0),
                      ),
                      label: Text(
                        _filtroGenero!,
                        style: const TextStyle(fontSize: 12),
                      ),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () {
                        setState(() {
                          _filtroGenero = null;
                        });
                      },
                      backgroundColor: Colors.purple[50],
                      side: BorderSide(color: Colors.purple[200]!),
                    ),
                  if (_filtroTipoSangre != null)
                    Chip(
                      avatar: const Icon(
                        Icons.bloodtype,
                        size: 16,
                        color: Colors.red,
                      ),
                      label: Text(
                        _filtroTipoSangre!,
                        style: const TextStyle(fontSize: 12),
                      ),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () {
                        setState(() {
                          _filtroTipoSangre = null;
                        });
                      },
                      backgroundColor: Colors.red[50],
                      side: BorderSide(color: Colors.red[200]!),
                    ),
                ],
              ),
            ),
          if (_tienesFiltrosActivos)
            const SizedBox(height: 8),
          // Lista de fichas
          Expanded(
            child: _fichas.isEmpty && _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _fichas.isEmpty && !_isLoading
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inbox, size: 80, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text(
                              'No hay fichas disponibles',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : _fichasFiltradas.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.search_off, size: 80, color: Colors.grey[300]),
                                const SizedBox(height: 16),
                                Text(
                                  'No se encontraron resultados',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Intenta con otro término de búsqueda',
                                  style: TextStyle(
                                    color: Colors.grey[500],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _cargarFichas,
                            child: ListView.builder(
                              controller: _scrollController,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _fichasFiltradas.length + (_hasMore && _searchQuery.isEmpty ? 1 : 0),
                              itemBuilder: (context, index) {
                                if (index == _fichasFiltradas.length) {
                                  // Indicador de carga al final
                                  return const Padding(
                                    padding: EdgeInsets.all(16.0),
                                    child: Center(child: CircularProgressIndicator()),
                                  );
                                }

                                final f = _fichasFiltradas[index];
                                final nombre = f['nombre'] ?? 'Sin nombre';
                                final rut = f['Rut']?.toString() ?? 'N/A';
                                final tipoSangre = f['tipoSangre'] ?? 'N/A';
                                final sexo = f['sexo'] ?? 'N/A';
                                
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: InkWell(
                                    onTap: () async {
                                      try {
                                        final idFicha = f['idFichaMedica'];
                                        if (idFicha == null) {
                                          throw Exception('ID de ficha no disponible');
                                        }
                                        
                                        final ficha = await ApiService.getFicha(idFicha as int);
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
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(16),
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.white,
                                            Colors.blue.withOpacity(0.05),
                                          ],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Row(
                                          children: [
                                            // Avatar con gradiente
                                            Container(
                                              width: 60,
                                              height: 60,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                gradient: LinearGradient(
                                                  colors: [
                                                    const Color(0xFF1565C0),
                                                    const Color(0xFF0D47A1),
                                                  ],
                                                  begin: Alignment.topLeft,
                                                  end: Alignment.bottomRight,
                                                ),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: const Color(0xFF1565C0).withOpacity(0.3),
                                                    blurRadius: 8,
                                                    offset: const Offset(0, 4),
                                                  ),
                                                ],
                                              ),
                                              child: Center(
                                                child: Text(
                                                  nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                                                  style: const TextStyle(
                                                    fontSize: 28,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 16),
                                            // Información
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
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 6),
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
                                                  const SizedBox(height: 4),
                                                  Row(
                                                    children: [
                                                      // Tipo de sangre
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(
                                                          horizontal: 8,
                                                          vertical: 2,
                                                        ),
                                                        decoration: BoxDecoration(
                                                          color: Colors.red.withOpacity(0.1),
                                                          borderRadius: BorderRadius.circular(8),
                                                        ),
                                                        child: Row(
                                                          mainAxisSize: MainAxisSize.min,
                                                          children: [
                                                            Icon(Icons.bloodtype, 
                                                              size: 12, 
                                                              color: Colors.red[700]
                                                            ),
                                                            const SizedBox(width: 4),
                                                            Text(
                                                              tipoSangre,
                                                              style: TextStyle(
                                                                color: Colors.red[700],
                                                                fontSize: 11,
                                                                fontWeight: FontWeight.w600,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                      const SizedBox(width: 8),
                                                      // Sexo
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(
                                                          horizontal: 8,
                                                          vertical: 2,
                                                        ),
                                                        decoration: BoxDecoration(
                                                          color: Colors.blue.withOpacity(0.1),
                                                          borderRadius: BorderRadius.circular(8),
                                                        ),
                                                        child: Row(
                                                          mainAxisSize: MainAxisSize.min,
                                                          children: [
                                                            Icon(
                                                              sexo == 'Masculino' 
                                                                ? Icons.male 
                                                                : sexo == 'Femenino'
                                                                  ? Icons.female
                                                                  : Icons.person,
                                                              size: 12,
                                                              color: Colors.blue[700],
                                                            ),
                                                            const SizedBox(width: 4),
                                                            Text(
                                                              sexo,
                                                              style: TextStyle(
                                                                color: Colors.blue[700],
                                                                fontSize: 11,
                                                                fontWeight: FontWeight.w600,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                            // Icono de flecha
                                            Container(
                                              padding: const EdgeInsets.all(8),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF1565C0).withOpacity(0.1),
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(
                                                Icons.chevron_right,
                                                color: Color(0xFF1565C0),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _mostrarFiltros,
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        elevation: 4,
        icon: Stack(
          children: [
            const Icon(Icons.filter_list, color: Colors.white),
            if (_tienesFiltrosActivos)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 8,
                    minHeight: 8,
                  ),
                ),
              ),
          ],
        ),
        label: const Text(
          'Filtros',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
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
      
      // Validar que idFicha no sea null
      if (idFicha == null) {
        throw Exception('No se pudo obtener el ID de la ficha médica');
      }
      
      final fichaActualizada = await ApiService.getFicha(idFicha as int);
      
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
      
      // Validar que idFicha no sea null
      if (idFicha == null) {
        throw Exception('No se pudo obtener el ID de la ficha médica');
      }
      
      final success = await ApiService.eliminarFicha(idFicha as int);

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
          content: Text('Error al eliminar: $e'),
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
