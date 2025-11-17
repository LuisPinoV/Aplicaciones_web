<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoAlergia extends Model
{
    protected $table = 'tipoalergia';
    protected $primaryKey = 'idTipoAlergia';
    protected $fillable = ['tipoAlergia'];

    public function alergias()
    {
        return $this->hasMany(Alergia::class, 'idTipoAlergia');
    }
}
