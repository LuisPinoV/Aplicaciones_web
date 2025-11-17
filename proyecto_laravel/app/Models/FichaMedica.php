<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichaMedica extends Model
{
    protected $table = 'fichamedica';
    protected $primaryKey = 'idFichaMedica';
    protected $fillable = ['idUsuario','altura','peso','genero'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario');
    }

    public function diagnosticos()
    {
        return $this->hasMany(Diagnostico::class, 'idFichaMedica');
    }

    public function hospitalizaciones()
    {
        return $this->hasMany(Hospitalizacion::class, 'idFichaMedica');
    }

    public function FichaMedicaAlergias()
    {
        return $this->hasMany(FichaMedicaAlergia::class, 'idFichaMedica');
    }

    public function FichaMedicaCirujias()
    {
        return $this->hasMany(FichaMedicaCirujia::class, 'idFichaMedica');
    }

    public function FichaMedicaEnfermedades()
    {
        return $this->hasMany(FichaMedicaEnfermedad::class, 'idFichaMedica');
    }

    public function consultas()
    {
        return $this->hasMany(Consulta::class, 'idFichaMedica');
    }
}
