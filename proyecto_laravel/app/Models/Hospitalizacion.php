<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospitalizacion extends Model
{
    protected $table = 'hospitalizacion';
    protected $primaryKey = 'idHospitalizacion';
    protected $fillable = ['idFichaMedica','fecha','duracion','institucionMedica'];

    public function fichaMedica()
    {
        return $this->belongsTo(FichaMedica::class, 'idFichaMedica');
    }
}
