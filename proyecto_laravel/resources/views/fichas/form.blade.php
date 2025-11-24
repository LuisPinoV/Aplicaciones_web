<div class="mb-3">
    <label class="form-label fw-semibold">Nombre</label>
    <input type="text" name="nombre" class="form-control"
        value="{{ old('nombre', $ficha->usuario->nombre ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">RUT</label>
    <input type="text" name="rut" class="form-control"
        value="{{ old('rut', $ficha->usuario->rut ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">Fecha de Nacimiento</label>
    <input type="date" name="fechaNacimiento" class="form-control"
        value="{{ old('fechaNacimiento', $ficha->usuario->fechaNacimiento ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">Sexo</label>
    <input type="text" name="sexo" class="form-control"
        value="{{ old('sexo', $ficha->usuario->sexo ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">Tipo Sangre</label>
    <input type="text" name="tipoSangre" class="form-control"
        value="{{ old('tipoSangre', $ficha->usuario->tipoSangre ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">Altura (cm)</label>
    <input type="number" name="altura" class="form-control"
        value="{{ old('altura', $ficha->altura ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">Peso (kg)</label>
    <input type="number" name="peso" class="form-control"
        value="{{ old('peso', $ficha->peso ?? '') }}" required>
</div>

<div class="mb-3">
    <label class="form-label fw-semibold">Género</label>
    <input type="text" name="genero" class="form-control"
        value="{{ old('genero', $ficha->genero ?? '') }}" required>
</div>
