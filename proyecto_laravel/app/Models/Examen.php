<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    protected $table = 'examen';
    protected $primaryKey = 'idExamen';
    protected $fillable = ['idTipoExamen','nombre','descripcion'];

    public function tipo()
    {
        return $this->belongsTo(TipoExamen::class, 'idTipoExamen');
    }

    public function ConsultaExamenes()
    {
        return $this->hasMany(ConsultaExamen::class, 'idExamen');
    }
}
