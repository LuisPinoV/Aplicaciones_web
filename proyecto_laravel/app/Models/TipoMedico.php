<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoMedico extends Model
{
    protected $table = 'tipomedico';
    protected $primaryKey = 'idTipoMedico';
    protected $fillable = ['tipoMedico'];

    public function medicos()
    {
        return $this->hasMany(Medico::class, 'idTipoMedico');
    }
}
