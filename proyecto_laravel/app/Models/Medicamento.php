<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicamento extends Model
{
    protected $table = 'medicamento';
    protected $primaryKey = 'idMedicamento';
    protected $fillable = ['idTipoMedicamento','nombre','descripcion'];

    public function tipo()
    {
        return $this->belongsTo(TipoMedicamento::class, 'idTipoMedicamento');
    }

    public function consultaMedicamentos()
    {
        return $this->hasMany(ConsultaMedicamento::class, 'idMedicamento');
    }
}
