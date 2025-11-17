<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alergia extends Model
{
    protected $table = 'alergia';
    protected $primaryKey = 'idAlergia';
    protected $fillable = ['idTipoAlergia','nombre','descripcion'];

    public function tipo()
    {
        return $this->belongsTo(TipoAlergia::class, 'idTipoAlergia');
    }

    public function fichaMedicaAlergias()
    {
        return $this->hasMany(FichaMedicaAlergia::class, 'idAlergia');
    }
}
