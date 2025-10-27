import 'package:flutter/material.dart';
import 'package:namer_app/services/apidog.dart';

class DogApiPage extends StatefulWidget {
  const DogApiPage({super.key});

  @override
  State<DogApiPage> createState() => _DogApiPageState();
}

class _DogApiPageState extends State<DogApiPage> {
  Map<String, List<String>> _breeds = {};
  String? _selectedBreed;
  String? _imageUrl;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initStadete();
    _fetchBreeds();
  }

  Future<void> _fetchBreeds() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final service = DogApiService();
      final breeds = await service.getBreeds();
      setState(() {
        _breeds = breeds;
        _selectedBreed = breeds.keys.isNotEmpty ? breeds.keys.first : null;
      });
    } catch (e) {
      setState(() {
        _error = 'Error cargando razas: $e';
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _fetchImage() async {
    if (_selectedBreed == null) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final breed = _selectedBreed!;
      final service = DogApiService();
      final image = await service.getRandomImage(breed);
      setState(() => _imageUrl = image);
    } catch (e) {
      setState(() {
        _error = 'Error cargando imagen: $e';
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dog API demo')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_loading) const LinearProgressIndicator(),
            const SizedBox(height: 8),
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 8),
            ],

            Card(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Seleccionar raza', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (_breeds.isEmpty) ...[
                      ElevatedButton(onPressed: _fetchBreeds, child: const Text('Cargar razas')),
                    ] else ...[
                      DropdownButton<String>(
                        value: _selectedBreed,
                        isExpanded: true,
                        items: _buildBreedItems(),
                        onChanged: (v) => setState(() => _selectedBreed = v),
                      ),
                      const SizedBox(height: 8),
                      ElevatedButton(onPressed: _fetchImage, child: const Text('Mostrar imagen aleatoria')),
                    ]
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),
            Expanded(
              child: Center(
                child: _imageUrl == null
                    ? const Text('Aquí aparecerá la imagen del perro')
                    : Image.network(_imageUrl!, fit: BoxFit.contain, loadingBuilder: (c, child, progress) {
                        if (progress == null) return child;
                        return const CircularProgressIndicator();
                      }),
              ),
            ),

            Row(
              children: [
                Expanded(child: ElevatedButton.icon(onPressed: _fetchImage, icon: const Icon(Icons.refresh), label: const Text('Refrescar'))),
                const SizedBox(width: 8),
                IconButton(onPressed: _fetchBreeds, icon: const Icon(Icons.sync)),
              ],
            )
          ],
        ),
      ),
    );
  }

  List<DropdownMenuItem<String>> _buildBreedItems() {
    final items = <DropdownMenuItem<String>>[];
    for (final entry in _breeds.entries) {
      final breed = entry.key;
      final subs = entry.value;
      if (subs.isEmpty) {
        items.add(DropdownMenuItem(value: breed, child: Text(breed)));
      } else {
        for (final s in subs) {
          items.add(DropdownMenuItem(value: '$breed/$s', child: Text('$breed / $s')));
        }
      }
    }
    return items;
  }
}

void main() => runApp(const MaterialApp(home: DogApiPage(), debugShowCheckedModeBanner: false));
