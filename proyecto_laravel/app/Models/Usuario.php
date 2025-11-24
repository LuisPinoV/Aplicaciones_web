<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{

    protected $table = 'Usuario';
    protected $primaryKey = 'idUsuario';
    public $timestamps = false;
    protected $fillable = ['rut','contraseña','fechaNacimiento','nombre','sexo','tipoSangre'];

    public function fichaMedica()
    {
        return $this->hasOne(FichaMedica::class, 'idUsuario', 'idUsuario');
    }
}
