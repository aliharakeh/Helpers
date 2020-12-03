<?php

namespace App\Traits;

use Closure;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Throwable;
use Exception;

trait SoftDeletesHelper
{

    /**
     * checks if the relationship is supported or not
     *
     * @param Relation $relationModel ex: $course->doctors()
     * @return bool
     */
    private function isRelationshipSupported(Relation $relationModel) : bool
    {
        if ($relationModel instanceof HasOne ||
            $relationModel instanceof HasMany ||
            $relationModel instanceof BelongsToMany) {
            return true;
        }
        return false;
    }

    /**
     * checks if the relationship is many-to-many
     *
     * @param Relation $relationModel ex: $course->doctors()
     * @return bool
     */
    private function isManyToMany(Relation $relationModel) : bool
    {
        if ($relationModel instanceof BelongsToMany) {
            return true;
        }
        return false;
    }

    /**
     * handles soft delete and restore of many-to-many relationships
     *
     * @param string        $action restore or delete
     * @param BelongsToMany $relationModel ex: $course->doctors()
     * @param Closure|null  $closure
     * @return void
     */
    private function handlePivot(string $action, BelongsToMany $relationModel, Closure $closure = null) : void
    {
        // update $deleted_at according to $action value
        $deleted_at = null;
        if ($action === 'delete') {
            $deleted_at = now();
        }

        // get the source model's pivot key name, the pivot table name, and initialize the update query
        $pivotKey = $relationModel->getForeignPivotKeyName();
        $query = DB::table($relationModel->getTable());

        // add the needed where closure
        if ($closure) {
            $query = $query->where($closure);
        } else {
            $query = $query->where($pivotKey, $this->{$this->primaryKey});
        }

        // update the pivot table deleted_at column
        $query->update([$this->getDeletedAtColumn() => $deleted_at]);
    }

    /**
     * handles restore|delete operations of the specified relationships inside the model.
     * <h2><u><b>Note:</b></u> Applies <u><b>only<b/><u/> for hasOne() / hasMany() / belongsToMany() relations for now.
     *
     * @param string $action restore or delete
     * @param array  $relationships list of relations names with or without where closure for each
     * @param bool   $withModel specify whether to also apply $action on model instance
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool   $strict whether to rollback changes if any provided relation is not supported
     * @return bool
     */
    private function handleRelated(string $action, array $relationships, bool $withModel = false, bool $strict = false) : bool
    {
        // check parameters
        if (!is_array($relationships)) {
            return false;
        }

        try {
            // attempt the transaction 3 times before failing in case of a deadlock
            DB::transaction(function () use ($action, $withModel, $relationships, $strict) {
                // perform the action on model's instance
                if ($withModel) {
                    $this->$action();
                }

                // perform the action on related relationships
                /**
                 * In php, index arrays use the index as a key while associative arrays use any accepted key type.
                 * To differentiate them we can check the key type and base our action on it.
                 * In our case, an integer key will apply no closure, while the string key will apply the custom
                 * provided closure.
                 */
                foreach ($relationships as $key => $value) {
                    // handle parameters
                    if (is_string($key)) {
                        $relation = $key;
                        $closure = $value;
                        $where = true;
                    } else {
                        $relation = $value;
                        $closure = null;
                        $where = false;
                    }

                    // get the relationship model
                    $relationModel = $this->$relation();

                    // check if model relation is supported
                    if (!$this->isRelationshipSupported($relationModel)) {
                        if ($strict) {
                            throw new Exception("Model Relation `{$relation}` is not supported");
                        }
                    }

                    // handle the relationship model action
                    if ($this->isManyToMany($relationModel)) {
                        $this->handlePivot($action, $relationModel, $closure);
                    } else {
                        $where ? $relationModel->where($value)->$action() : $relationModel->$action();
                    }
                }
            }, 3);

            return true;
        }
        catch (Throwable $t) {
            // dump($t->getTraceAsString());
        }
        return false;
    }

    /**
     * soft deletes the specified relationships inside the model
     * <h2><u><b>Note:</b></u> Applies <u><b>only<b/><u/> for hasOne() / hasMany() / belongsToMany() relations for now.
     *
     * @param array $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relation is not supported
     * @return bool
     */
    function deleteRelated(array $relationships, bool $strict = false) : bool
    {
        return $this->handleRelated("delete", $relationships, $strict);
    }

    /**
     * restores the soft deleted data of the specified relationships inside the model
     * <h2><u><b>Note:</b></u> Applies <u><b>only<b/><u/> for hasOne() / hasMany() / belongsToMany() relations for now.
     *
     * @param array $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relation is not supported
     * @return bool
     */
    function restoreRelated(array $relationships, bool $strict = false) : bool
    {
        return $this->handleRelated("restore", $relationships, $strict);
    }

    /**
     * soft deletes all specified related data of the model
     * <h2><u><b>Note:</b></u> Applies <u><b>only</b></u> for hasOne() / hasMany() / belongsToMany() relations for now.
     *
     * @param array $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relation is not supported
     * @return bool
     */
    function deleteWithRelated(array $relationships, bool $strict = false) : bool
    {
        return $this->handleRelated("delete", $relationships, true, $strict);
    }

    /**
     * restores all of the specified soft deleted data of the model
     * <h2><u><b>Note:</b></u> Applies <u><b>only<b/><u/> for hasOne() / hasMany() / belongsToMany() relations for now.
     *
     * @param array $relationships list of relations names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relation is not supported
     * @return bool
     */
    function restoreWithRelated(array $relationships, bool $strict = false) : bool
    {
        return $this->handleRelated("restore", $relationships, true, $strict);
    }

}
