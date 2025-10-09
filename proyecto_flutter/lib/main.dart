import 'package:flutter/material.dart';

void main() {
  runApp(const MediGestApp());
}

class MediGestApp extends StatelessWidget {
  const MediGestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediGest Pro',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const MainScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    DatosPersonalesPage(),
    ConsultaInicialPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.person),
                label: Text("Datos Personales"),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.assignment),
                label: Text("Consulta Inicial"),
              ),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: _pages[_selectedIndex]),
        ],
      ),
    );
  }
}

class DatosPersonalesPage extends StatelessWidget {
  const DatosPersonalesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Datos Personales")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            const Text("Nombre Completo"),
            const TextField(decoration: InputDecoration(hintText: "Ingrese el nombre")),
            const SizedBox(height: 16),
            const Text("Edad"),
            const TextField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(hintText: "Ingrese la edad"),
            ),
            const SizedBox(height: 16),
            const Text("Dirección"),
            const TextField(decoration: InputDecoration(hintText: "Ingrese dirección")),
            const SizedBox(height: 32),
            Row(
              children: [
                ElevatedButton(onPressed: () {}, child: const Text("Guardar Ficha")),
                const SizedBox(width: 10),
                OutlinedButton(onPressed: () {}, child: const Text("Cancelar")),
              ],
            )
          ],
        ),
      ),
    );
  }
}

class ConsultaInicialPage extends StatelessWidget {
  const ConsultaInicialPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Consulta Inicial")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            const Text("Médico Tratante"),
            DropdownButtonFormField<String>(
              items: const [
                DropdownMenuItem(value: "Dr. A", child: Text("Dr. A")),
                DropdownMenuItem(value: "Dr. B", child: Text("Dr. B")),
              ],
              onChanged: (value) {},
              decoration: const InputDecoration(hintText: "Seleccionar médico"),
            ),
            const SizedBox(height: 16),
            const Text("Previsión"),
            DropdownButtonFormField<String>(
              items: const [
                DropdownMenuItem(value: "Fonasa", child: Text("Fonasa")),
                DropdownMenuItem(value: "Isapre", child: Text("Isapre")),
              ],
              onChanged: (value) {},
              decoration: const InputDecoration(hintText: "Seleccionar previsión"),
            ),
            const SizedBox(height: 16),
            const Text("Motivo de Consulta Inicial"),
            const TextField(
              maxLines: 3,
              decoration: InputDecoration(hintText: "Describa el motivo principal..."),
            ),
            const SizedBox(height: 16),
            const Text("Antecedentes Médicos Relevantes"),
            const TextField(
              maxLines: 3,
              decoration: InputDecoration(hintText: "Enfermedades previas, cirugías..."),
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                ElevatedButton(onPressed: () {}, child: const Text("Guardar Ficha")),
                const SizedBox(width: 10),
                OutlinedButton(onPressed: () {}, child: const Text("Cancelar")),
              ],
            )
          ],
        ),
      ),
    );
  }
}
