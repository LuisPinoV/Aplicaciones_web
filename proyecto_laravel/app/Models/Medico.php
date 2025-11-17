<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medico extends Model
{
    protected $table = 'medico';
    protected $primaryKey = 'idMedico';
    protected $fillable = ['idTipoMedico','nombre','rut','fechaNacimiento','sexo'];

    public function tipo()
    {
        return $this->belongsTo(TipoMedico::class, 'idTipoMedico');
    }

    public function consultas()
    {
        return $this->hasMany(Consulta::class, 'idMedico');
    }
}
