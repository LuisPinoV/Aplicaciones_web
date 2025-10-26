import 'package:flutter/material.dart';
import 'services/servicesFichaMedica.dart';

class EditarFichaPage extends StatefulWidget {
  final Map<String, dynamic> ficha;

  const EditarFichaPage({super.key, required this.ficha});

  @override
  State<EditarFichaPage> createState() => _EditarFichaPageState();
}

class _EditarFichaPageState extends State<EditarFichaPage> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controladores
  late TextEditingController _nombreController;
  late TextEditingController _rutController;
  late TextEditingController _alturaController;
  late TextEditingController _pesoController;
  
  String? _tipoSangreSeleccionado;
  String? _sexoSeleccionado;
  String? _generoSeleccionado;
  DateTime? _fechaNacimiento;

  final List<String> _tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  final List<String> _sexos = ['Masculino', 'Femenino', 'Otro'];
  final List<String> _generos = ['Hombre', 'Mujer', 'Otro'];

  @override
  void initState() {
    super.initState();
    final f = widget.ficha['ficha'] ?? widget.ficha;
    
    _nombreController = TextEditingController(text: f['nombre'] ?? '');
    _rutController = TextEditingController(text: f['Rut']?.toString() ?? '');
    _alturaController = TextEditingController(text: f['altura']?.toString() ?? '');
    _pesoController = TextEditingController(text: f['peso']?.toString() ?? '');
    
    _tipoSangreSeleccionado = f['tipoSangre'];
    _sexoSeleccionado = f['sexo'];
    _generoSeleccionado = f['genero'];
    
    // Parsear fecha de nacimiento
    if (f['fechaNacimiento'] != null && f['fechaNacimiento'] != 'N/A') {
      try {
        _fechaNacimiento = DateTime.parse(f['fechaNacimiento']);
      } catch (e) {
        _fechaNacimiento = null;
      }
    }
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _rutController.dispose();
    _alturaController.dispose();
    _pesoController.dispose();
    super.dispose();
  }

  Future<void> _seleccionarFecha() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _fechaNacimiento ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      locale: const Locale('es', 'ES'),
    );
    if (picked != null && picked != _fechaNacimiento) {
      setState(() {
        _fechaNacimiento = picked;
      });
    }
  }

  Future<void> _guardarCambios() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final f = widget.ficha['ficha'] ?? widget.ficha;
      final idFicha = f['idFichaMedica'];

      final fichaActualizada = {
        'nombre': _nombreController.text.trim(),
        'Rut': int.tryParse(_rutController.text.trim()),
        'tipoSangre': _tipoSangreSeleccionado,
        'sexo': _sexoSeleccionado,
        'genero': _generoSeleccionado,
        'altura': double.tryParse(_alturaController.text.trim()),
        'peso': double.tryParse(_pesoController.text.trim()),
        'fechaNacimiento': _fechaNacimiento?.toIso8601String(),
      };

      final success = await ApiService.actualizarFicha(idFicha, fichaActualizada);

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ficha actualizada correctamente'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Retornar true para indicar que se actualizó
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al actualizar la ficha'),
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Editar Ficha Médica'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        actions: [
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                ),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.save),
              onPressed: _guardarCambios,
              tooltip: 'Guardar cambios',
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('Información Personal'),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: 'Nombre completo',
                  prefixIcon: Icon(Icons.person),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Por favor ingrese un nombre';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _rutController,
                decoration: const InputDecoration(
                  labelText: 'RUT',
                  prefixIcon: Icon(Icons.badge),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Por favor ingrese un RUT';
                  }
                  if (int.tryParse(value.trim()) == null) {
                    return 'RUT inválido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              InkWell(
                onTap: _seleccionarFecha,
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Fecha de Nacimiento',
                    prefixIcon: Icon(Icons.cake),
                    border: OutlineInputBorder(),
                  ),
                  child: Text(
                    _fechaNacimiento != null
                        ? '${_fechaNacimiento!.day}/${_fechaNacimiento!.month}/${_fechaNacimiento!.year}'
                        : 'Seleccione una fecha',
                    style: TextStyle(
                      color: _fechaNacimiento != null ? Colors.black : Colors.grey,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              DropdownButtonFormField<String>(
                value: _sexoSeleccionado,
                decoration: const InputDecoration(
                  labelText: 'Sexo',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
                items: _sexos.map((String sexo) {
                  return DropdownMenuItem<String>(
                    value: sexo,
                    child: Text(sexo),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _sexoSeleccionado = newValue;
                  });
                },
              ),
              const SizedBox(height: 16),
              
              DropdownButtonFormField<String>(
                value: _generoSeleccionado,
                decoration: const InputDecoration(
                  labelText: 'Género',
                  prefixIcon: Icon(Icons.wc),
                  border: OutlineInputBorder(),
                ),
                items: _generos.map((String genero) {
                  return DropdownMenuItem<String>(
                    value: genero,
                    child: Text(genero),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _generoSeleccionado = newValue;
                  });
                },
              ),
              const SizedBox(height: 24),
              
              _buildSectionTitle('Información Médica'),
              const SizedBox(height: 16),
              
              DropdownButtonFormField<String>(
                value: _tipoSangreSeleccionado,
                decoration: const InputDecoration(
                  labelText: 'Tipo de Sangre',
                  prefixIcon: Icon(Icons.bloodtype),
                  border: OutlineInputBorder(),
                ),
                items: _tiposSangre.map((String tipo) {
                  return DropdownMenuItem<String>(
                    value: tipo,
                    child: Text(tipo),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _tipoSangreSeleccionado = newValue;
                  });
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _alturaController,
                decoration: const InputDecoration(
                  labelText: 'Altura (metros)',
                  prefixIcon: Icon(Icons.height),
                  border: OutlineInputBorder(),
                  suffixText: 'm',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value != null && value.trim().isNotEmpty) {
                    if (double.tryParse(value.trim()) == null) {
                      return 'Altura inválida';
                    }
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _pesoController,
                decoration: const InputDecoration(
                  labelText: 'Peso (kilogramos)',
                  prefixIcon: Icon(Icons.monitor_weight),
                  border: OutlineInputBorder(),
                  suffixText: 'kg',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value != null && value.trim().isNotEmpty) {
                    if (double.tryParse(value.trim()) == null) {
                      return 'Peso inválido';
                    }
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),
              
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _guardarCambios,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Guardar Cambios',
                          style: TextStyle(fontSize: 16),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Color(0xFF1565C0),
      ),
    );
  }
}
