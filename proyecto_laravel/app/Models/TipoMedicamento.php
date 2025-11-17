<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoMedicamento extends Model
{
    protected $table = 'tipomedicamento';
    protected $primaryKey = 'idTipoMedicamento';
    protected $fillable = ['tipoMedicamento'];

    public function medicamentos()
    {
        return $this->hasMany(Medicamento::class, 'idTipoMedicamento');
    }
}
