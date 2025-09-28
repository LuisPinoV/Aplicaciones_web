echo "Iniciando microservicios..."

json-server --watch microservicios/pacientes/db.json --port 4002 &
echo $! >> microservicios.pid

json-server --watch microservicios/diagnosticos/db.json --port 4003 &
echo $! >> microservicios.pid

json-server --watch microservicios/hospitalizaciones/db.json --port 4004 &
echo $! >> microservicios.pid

json-server --watch microservicios/consultas/db.json --port 4005 &
echo $! >> microservicios.pid

json-server --watch microservicios/alergias/db.json --port 4006 &
echo $! >> microservicios.pid

json-server --watch microservicios/procedimientos/db.json --port 4007 &
echo $! >> microservicios.pid

json-server --watch microservicios/medicamentos/db.json --port 4008 &
echo $! >> microservicios.pid

echo "Microservicios iniciados. PIDs guardados en microservicios.pid"
