<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;

trait SoftDeletesHelper
{
    /**
     * handles restore|delete operations of the specified relationships inside the model.
     * <h2><u><b>Note:</b></u> Only applies for hasOne() / hasMany() relationships</h2>
     *
     * @param string $action restore or delete
     * @param string $foreignKey model's foreign key in related table
     * @param array  $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @return bool
     */
    private function handleRelated(string $action, string $foreignKey, array $relationships) : bool
    {
        try {
            // attempt the transaction 3 times before failing in case of a deadlock
            DB::transaction(function () use ($action, $foreignKey, $relationships) {
                // get the pk value from the model instance
                $pkValue = $this->{$this->primaryKey};

                // In php, index arrays use the index as a key while associative arrays use any accepted key type.
                // To differentiate them we can check the key type and base our action on it.
                // In our case, an integer key will apply the default relationship closure, while the string key
                // will apply the custom provided closure.
                foreach ($relationships as $key => $value) {
                    if (is_string($key)) {
                        $this->{$key}()->where($value)->{$action}();
                    } else {
                        $this->{$value}()->where($foreignKey, $pkValue)->{$action}();
                    }
                }
            }, 3);

            return true;
        }
        catch (\Throwable $e) {
            // dump($e->getTraceAsString());
            return false;
        }
    }

    /**
     * soft deletes the specified relationships inside the model
     * <h2><u><b>Note:</b></u> Only applies for hasOne() / hasMany() relationships</h2>
     *
     * @param string $foreignKey model's foreign key in related table
     * @param array  $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @return bool
     */
    function deleteRelated(string $foreignKey, array $relationships) : bool
    {
        return $this->handleRelated("delete", $foreignKey, $relationships);
    }

    /**
     * restores the soft deleted data of the specified relationships inside the model
     * <h2><u><b>Note:</b></u> Only applies for hasOne() / hasMany() relationships</h2>
     *
     * @param string $foreignKey model's foreign key in related table
     * @param array  $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @return bool
     */
    function restoreRelated(string $foreignKey, array $relationships) : bool
    {
        return $this->handleRelated("restore", $foreignKey, $relationships);
    }

    /**
     * soft deletes all specified related data of the model
     * <h2><u><b>Note:</b></u> Only applies for hasOne() / hasMany() relationships</h2>
     *
     * @param string $foreignKey model's foreign key in related table
     * @param array  $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @return bool
     */
    function deleteWithRelated(string $foreignKey, array $relationships) : bool
    {
        try {
            // save previous soft delete state state
            $softDeleted = $this->trashed();

            // delete model if it was not soft deleted before
            // return false if delete failed or data doesn't exit
            if (!$softDeleted && !$this->delete()) {
                return false;
            }

            // delete related data
            // rollback previous soft delete state if an error occurred
            if (!$this->deleteRelated($foreignKey, $relationships) && !$softDeleted) {
                $this->restore();
                return false;
            }

            return true;
        }
        catch (\Exception $e) {
            // dump($e->getTraceAsString());
        }
        return false;
    }

    /**
     * restores all of the specified soft deleted data of the model
     * <h2><u><b>Note:</b></u> Only applies for hasOne() / hasMany() relationships</h2>
     *
     * @param string $foreignKey model's foreign key in related table
     * @param array  $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @return bool
     */
    function restoreWithRelated(string $foreignKey, array $relationships) : bool
    {
        try {
            // save previous soft delete state state
            $softDeleted = $this->trashed();

            // delete model if it was not soft deleted before
            // return false if delete failed or data doesn't exit
            if ($softDeleted && !$this->restore()) {
                return false;
            }

            // restore related data
            // rollback previous soft delete state if an error occurred
            if (!$this->restoreRelated($foreignKey, $relationships) && $softDeleted) {
                $this->delete();
                return false;
            }

            return true;
        }
        catch (\Exception $e) {
            // dump($e->getTraceAsString());
        }
        return false;
    }

}
