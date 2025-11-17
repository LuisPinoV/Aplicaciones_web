<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnostico extends Model
{
    protected $table = 'diagnostico';
    protected $primaryKey = 'idDiagnostico';
    protected $fillable = ['idFichaMedica','fecha','descripcion'];

    public function fichaMedica()
    {
        return $this->belongsTo(FichaMedica::class, 'idFichaMedica');
    }
}
