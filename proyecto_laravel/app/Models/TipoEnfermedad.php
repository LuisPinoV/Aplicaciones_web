<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoEnfermedad extends Model
{
    protected $table = 'tipoenfermedad';
    protected $primaryKey = 'idTipoEnfermedad';
    protected $fillable = ['tipoEnfermedad'];

    public function enfermedades()
    {
        return $this->hasMany(Enfermedad::class, 'idTipoEnfermedad');
    }
}
