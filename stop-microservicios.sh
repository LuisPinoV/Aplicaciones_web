echo "Deteniendo microservicios json-server..."

if [ -f microservicios.pid ]; then
  while read pid; do
    kill -9 $pid 2>/dev/null
  done < microservicios.pid
  rm microservicios.pid
  echo "Todos los microservicios fueron detenidos."
else
  echo "No se encontró archivo microservicios.pid. ¿Ya habías iniciado los servicios?"
fi
