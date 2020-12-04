<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Relations\{Relation, HasOne, HasMany, HasOneThrough, HasManyThrough, BelongsToMany};
use Illuminate\Support\Facades\DB;
use Throwable;
use Exception;
use Closure;

trait SoftDeletesHelper
{
    /**
     * soft deletes the specified relationships inside the model
     * <h2><u><b>Note:</b></u></h2>
     * Applies <u><b>only</b></u> on the following relationships:
     * <ul>
     * <li>hasOne()</li>
     * <li>hasMany()</li>
     * <li>hasOneThrough()</li>
     * <li>hasManyThrough()</li>
     * <li>belongsToMany()</li>
     * </ul>
     * <b>Any unsupported relationship will be ignored if $strict was false, else the whole operation will fail</b>
     *
     * @param array $relationships list of relationships names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relationship is not supported
     * @return bool
     */
    function deleteRelated(array $relationships, bool $strict = true) : bool
    {
        return $this->handleRelated("delete", $relationships, $strict);
    }

    /**
     * restores the soft deleted data of the specified relationships inside the model
     * <h2><u><b>Note:</b></u></h2>
     * Applies <u><b>only</b></u> on the following relationships:
     * <ul>
     * <li>hasOne()</li>
     * <li>hasMany()</li>
     * <li>hasOneThrough()</li>
     * <li>hasManyThrough()</li>
     * <li>belongsToMany()</li>
     * </ul>
     * <b>Any unsupported relationship will be ignored if $strict was false, else the whole operation will fail</b>
     *
     * @param array $relationships list of relationships names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relationship is not supported
     * @return bool
     */
    function restoreRelated(array $relationships, bool $strict = true) : bool
    {
        return $this->handleRelated("restore", $relationships, $strict);
    }

    /**
     * soft deletes all specified related data of the model
     * <h2><u><b>Note:</b></u></h2>
     * Applies <u><b>only</b></u> on the following relationships:
     * <ul>
     * <li>hasOne()</li>
     * <li>hasMany()</li>
     * <li>hasOneThrough()</li>
     * <li>hasManyThrough()</li>
     * <li>belongsToMany()</li>
     * </ul>
     * <b>Any unsupported relationship will be ignored if $strict was false, else the whole operation will fail</b>
     *
     * @param array $relationships list of relationships names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relationship is not supported
     * @return bool
     */
    function deleteWithRelated(array $relationships, bool $strict = true) : bool
    {
        return $this->handleRelated("delete", $relationships, $strict, true);
    }

    /**
     * restores all of the specified soft deleted data of the model
     * <h2><u><b>Note:</b></u></h2>
     * Applies <u><b>only</b></u> on the following relationships:
     * <ul>
     * <li>hasOne()</li>
     * <li>hasMany()</li>
     * <li>hasOneThrough()</li>
     * <li>hasManyThrough()</li>
     * <li>belongsToMany()</li>
     * </ul>
     * <b>Any unsupported relationship will be ignored if $strict was false, else the whole operation will fail</b>
     *
     * @param array $relationships list of relationships names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool  $strict whether to rollback changes if any provided relationship is not supported
     * @return bool
     */
    function restoreWithRelated(array $relationships, bool $strict = true) : bool
    {
        return $this->handleRelated("restore", $relationships, $strict, true);
    }

    /**
     * checks if the relationship is supported or not
     *
     * @param Relation $relationshipModel ex: $course->doctors()
     * @return bool
     */
    private function isRelationshipSupported(Relation $relationshipModel) : bool
    {
        if ($relationshipModel instanceof HasOne ||
            $relationshipModel instanceof HasMany ||
            $relationshipModel instanceof HasOneThrough ||
            $relationshipModel instanceof HasManyThrough ||
            $relationshipModel instanceof BelongsToMany) {
            return true;
        }
        return false;
    }

    /**
     * checks if the relationship type is many-to-many
     *
     * @param Relation $relationshipModel ex: $course->doctors()
     * @return bool
     */
    private function isManyToMany(Relation $relationshipModel) : bool
    {
        if ($relationshipModel instanceof BelongsToMany) {
            return true;
        }
        return false;
    }

    /**
     * checks if the relationship type is has-one-through or has-many-through
     *
     * @param Relation $relationshipModel ex: $department->doctorsLogs()
     * @return bool
     */
    private function isThrough(Relation $relationshipModel) : bool
    {
        if ($relationshipModel instanceof HasOneThrough || $relationshipModel instanceof HasManyThrough) {
            return true;
        }
        return false;
    }

    /**
     * handles soft delete and restore of many-to-many relationship
     *
     * @param string        $action restore or delete
     * @param BelongsToMany $relationshipModel ex: $course->doctors()
     * @param Closure|null  $closure where closure
     * @return void
     */
    private function handlePivot(string $action, BelongsToMany $relationshipModel, Closure $closure = null) : void
    {
        // update $deleted_at according to $action value
        $date = null;
        if ($action === 'delete') {
            $date = now();
        }

        // get the pivot table name, source model's pivot key name, deleted column name, and updated column name
        $pivotTable = $relationshipModel->getTable();
        $pivotKey = $relationshipModel->getForeignPivotKeyName();
        $deletedAtColumn = $this->getDeletedAtColumn();
        $updatedAtColumn = $this->getUpdatedAtColumn();

        // initializes the query
        $query = DB::table($pivotTable)->where([
            [$pivotKey, $this->{$this->primaryKey}],
            [$deletedAtColumn, null]
        ]);

        // add the extra where closure if provided
        if ($closure) {
            $query = $query->where($closure);
        }

        // update the pivot table columns
        $query->update([
            $deletedAtColumn => $date,
            $updatedAtColumn => $date
        ]);
    }

    /**
     * handles soft delete and restore of has-one-through or has-many-through relationships
     *
     * @param string         $action restore or delete
     * @param HasManyThrough $relationshipModel ex: $course->doctors()
     * @param Closure|null   $closure where closure
     * @return void
     */
    private function handleThrough(string $action, HasManyThrough $relationshipModel, Closure $closure = null) : void
    {
        // initialize the query
        $query = $relationshipModel;
        if ($action === 'restore') {
            $query = $query->onlyTrashed();
        }

        // add the extra where closure if provided
        if ($closure) {
            $query = $query->where($closure);
        }

        // get the related model and fix the ambiguous deleted_at column name
        $relatedModel = $relationshipModel->getRelated();
        $deletedAtColumn = $relatedModel->getTable() . "." . $relatedModel->getDeletedAtColumn();

        // apply action
        if ($action === 'delete') {
            $query->delete();
        } else {
            $query->update([
                $deletedAtColumn => null,
                $relatedModel->getUpdatedAtColumn() => now()
            ]);
        }
    }

    /**
     * handles restore|delete operations of the specified relationships inside the model.
     * <h2><u><b>Note:</b></u></h2>
     * Applies <u><b>only</b></u> on the following relationships:
     * <ul>
     * <li>hasOne()</li>
     * <li>hasMany()</li>
     * <li>hasOneThrough()</li>
     * <li>hasManyThrough()</li>
     * <li>belongsToMany()</li>
     * </ul>
     * <b>Any unsupported relationship will be ignored if $strict was false, else the whole operation will fail</b>
     *
     * @param string $action restore or delete
     * @param array  $relationships list of relationships names with or without where closure for each
     * @param bool   $withModel specify whether to also apply $action on model instance
     * (associative array with relationship name as key and `where` closure function as value)
     * @param bool   $strict whether to rollback changes if any provided relationship is not supported
     * @return bool
     */
    private function handleRelated(string $action, array $relationships, bool $strict = true, bool $withModel = false) : bool
    {
        // check parameters
        if (!is_array($relationships)) {
            return false;
        }

        try {
            // DB::enableQueryLog();

            // attempt the transaction 3 times before failing in case of a deadlock
            DB::transaction(function () use ($action, $relationships, $strict, $withModel) {
                // perform the action on the related relationships
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
                    $relationshipModel = $this->$relation();

                    // check if model relation is supported
                    if (!$this->isRelationshipSupported($relationshipModel)) {
                        if ($strict) {
                            throw new Exception("Model Relation `{$relation}` is not supported");
                        }
                        continue;
                    }

                    // handle the relationship model action
                    if ($this->isManyToMany($relationshipModel)) {
                        $this->handlePivot($action, $relationshipModel, $closure);

                    } elseif ($this->isThrough($relationshipModel)) {
                        $this->handleThrough($action, $relationshipModel, $closure);

                    } else {
                        $where ? $relationshipModel->where($value)->$action() : $relationshipModel->$action();
                    }
                }

                // perform the action on the model's instance
                if ($withModel) {
                    $this->$action();
                }

            }, 3);

            // dump(DB::getQueryLog());
            return true;
        }
        catch (Throwable $t) {
            // dump($t->getTraceAsString());
            dump($t->getMessage());
        }

        // dump(DB::getQueryLog());
        return false;
    }

}
