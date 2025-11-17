<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enfermedad extends Model
{
    protected $table = 'enfermedad';
    protected $primaryKey = 'idEnfermedad';
    protected $fillable = ['idTipoEnfermedad','nombre','descripcion'];

    public function tipo()
    {
        return $this->belongsTo(TipoEnfermedad::class, 'idTipoEnfermedad');
    }

    public function fichaMedicaEnfermedades()
    {
        return $this->hasMany(FichaMedicaEnfermedad::class, 'idEnfermedad');
    }
}
