<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoExamen extends Model
{
    protected $table = 'tipoexamen';
    protected $primaryKey = 'idTipoExamen';
    protected $fillable = ['tipoExamen'];

    public function examenes()
    {
        return $this->hasMany(Examen::class, 'idTipoExamen');
    }
}
