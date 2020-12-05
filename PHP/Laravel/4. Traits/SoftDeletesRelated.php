<?php

namespace App\Traits;

use Throwable;
use Exception;
use Closure;
use Illuminate\Database\Eloquent\Relations\{Relation, HasOne, HasMany, HasOneThrough, HasManyThrough, BelongsToMany};
use Illuminate\Support\Facades\DB;


trait SoftDeletesRelated
{
    /**
     * soft deletes the specified relationships inside the model.
     *
     * @param array|null $relationships
     * ['relation_1', 'relation_2', ...] <div><u>OR</u></div> ['relation_1' => function($query){ $query->where(...) }, 'relation_2']
     * @param bool       $strict
     * @return bool
     */
    public function deleteRelated(array $relationships = null, bool $strict = true) : bool
    {
        $relationships = $relationships ?? $this->getRelationships();
        return $this->handleRelated("delete", $relationships, $strict);
    }

    /**
     * restores the soft deleted data of the specified relationships inside the model.
     *
     * @param array|null $relationships
     * ['relation_1', 'relation_2', ...] <div><u>OR</u></div> ['relation_1' => function($query){ $query->where(...) }, 'relation_2']
     * @param bool       $strict
     * @return bool
     */
    public function restoreRelated(array $relationships = null, bool $strict = true) : bool
    {
        $relationships = $relationships ?? $this->getRelationships();
        return $this->handleRelated("restore", $relationships, $strict);
    }

    /**
     * soft deletes all specified related data of the model.
     *
     * @param array|null $relationships
     * ['relation_1', 'relation_2', ...] <div><u>OR</u></div> ['relation_1' => function($query){ $query->where(...) }, 'relation_2']
     * @param bool       $strict
     * @return bool
     */
    public function deleteWithRelated(array $relationships = null, bool $strict = true) : bool
    {
        $relationships = $relationships ?? $this->getRelationships();
        return $this->handleRelated("delete", $relationships, $strict, true);
    }

    /**
     * restores all of the specified soft deleted data of the model.
     *
     * @param array|null $relationships
     * ['relation_1', 'relation_2', ...] <div><u>OR</u></div> ['relation_1' => function($query){ $query->where(...) }, 'relation_2']
     * @param bool       $strict
     * @return bool
     */
    public function restoreWithRelated(array $relationships = null, bool $strict = true) : bool
    {
        $relationships = $relationships ?? $this->getRelationships();
        return $this->handleRelated("restore", $relationships, $strict, true);
    }

    /**
     * checks if the relationship is supported or not.
     *
     * @param Relation $relationshipModel ex: $course->doctors()
     * @return array
     */
    public function isRelationshipSupported(Relation $relationshipModel) : array
    {
        switch (true) {
            case $relationshipModel instanceof HasOne:
            case $relationshipModel instanceof HasMany:
                return [true, 'Normal'];

            case $relationshipModel instanceof HasOneThrough:
            case $relationshipModel instanceof HasManyThrough:
                return [true, 'Through'];

            case $relationshipModel instanceof BelongsToMany:
                return [true, 'Pivot'];

            default:
                return [false, 'Relationship Is Not Supported'];
        }
    }

    /**
     * gets the relationships names.
     *
     * @return array
     */
    public function getRelationships() : array
    {
        return $this->relationships ?? [];
    }

    /**
     * handles soft delete and restore of many-to-many relationship.
     *
     * @param string        $action restore or delete
     * @param BelongsToMany $relationshipModel ex: $course->doctors()
     * @param Closure|null  $callback where callback
     * @return void
     */
    private function handlePivot(string $action, BelongsToMany $relationshipModel, Closure $callback = null) : void
    {
        // get the pivot table name, source model's pivot key name, deleted column name, and updated column name
        $pivotTable = $relationshipModel->getTable();
        $pivotKey = $relationshipModel->getForeignPivotKeyName();
        $deletedAtColumn = $this->getDeletedAtColumn();
        $updatedAtColumn = $this->getUpdatedAtColumn();

        // initializes the query and timestamp updates
        $conditions = [[$pivotKey, $this->{$this->primaryKey}]];
        $updatedAt = now();
        $deletedAt = null;
        if ($action === 'delete') {
            $deletedAt = now();
            $conditions[] = [$deletedAtColumn, null];
        }
        $query = DB::table($pivotTable)->where($conditions);

        // add the extra where closure if provided
        if ($callback) {
            $query = $query->where($callback);
        }

        // update the pivot table columns
        $query->update([
            $deletedAtColumn => $deletedAt,
            $updatedAtColumn => $updatedAt
        ]);
    }

    /**
     * handles soft delete and restore of has-one-through or has-many-through relationships.
     *
     * @param string         $action restore or delete
     * @param HasManyThrough $relationshipModel ex: $course->doctors()
     * @param Closure|null   $callback where callback
     * @return void
     */
    private function handleThrough(string $action, HasManyThrough $relationshipModel, Closure $callback = null) : void
    {
        // initialize the query
        $query = $relationshipModel;
        if ($action === 'restore') {
            $query = $query->onlyTrashed();
        }

        // add the extra where closure if provided
        if ($callback) {
            $query = $query->where($callback);
        }

        // get the related model and fix the ambiguous deleted_at column name
        $relatedModel = $relationshipModel->getRelated();
        $deletedAtColumn = $relatedModel->getTable() . "." . $relatedModel->getDeletedAtColumn();

        // apply action
        if ($action === 'delete') {
            $query->delete();
        } else {
            // if you use restore instead here, an error will occur due to the ambiguous 'deleted_at' column
            // seems to be a laravel issue
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
     * <b>Any unsupported relationship will be ignored if $strict was false, else the whole operation will fail.</b>
     *
     * @param string $action restore or delete
     * @param array  $relationships list of relationships names with or without where closure for each
     * (associative array with relationship name as key and `where` closure function as value). If <b><u>null</u></b> is provided then
     * the relationships will be automatically discovered using their defined return type. If no return type was provided
     * then the operation will only apply on the model if <b><u>withModel</u></b> was set to <b><u>true</u></b>.
     * @param bool   $withModel specify whether to also apply $action on model instance.
     * @param bool   $strict whether to rollback changes if any provided relationship is not supported.
     * @return bool
     */
    private function handleRelated(string $action, array $relationships, bool $strict = true, bool $withModel = false) : bool
    {
        // check parameters
        if (!is_array($relationships) || (empty($relationships) && !$withModel)) {
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
                        $callback = $value;
                        $where = true;
                    } else {
                        $relation = $value;
                        $callback = null;
                        $where = false;
                    }

                    // get the relationship model
                    $relationshipModel = $this->$relation();

                    // check if model relation is supported
                    [$isSupported, $relationType] = $this->isRelationshipSupported($relationshipModel);
                    if (!$isSupported) {
                        if ($strict) {
                            throw new Exception("Model Relation `{$relation}` is not supported");
                        }
                        continue;
                    }

                    // handle the relationship model action
                    switch ($relationType) {
                        case 'Pivot':
                            $this->handlePivot($action, $relationshipModel, $callback);
                            break;

                        case 'Through':
                            $this->handleThrough($action, $relationshipModel, $callback);
                            break;

                        default:
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
