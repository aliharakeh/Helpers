import json
import sqlite3


class SqlLiteManager:
    DB_SCHEMA = None
    DB_PATH = None

    """""""""""""""""""""""""""""""""""""""""""""""
		Initialization
	"""""""""""""""""""""""""""""""""""""""""""""""

    def __init__(self, db_path, db_schema_path):
        self.DB_PATH = db_path

        with open(db_schema_path) as schema_file:
            self.DB_SCHEMA = json.load(schema_file)

    """""""""""""""""""""""""""""""""""""""""""""""
		General Methods
	"""""""""""""""""""""""""""""""""""""""""""""""

    def get_connection(self):
        conn = sqlite3.connect(self.DB_PATH)
        cursor = conn.cursor()
        return conn, cursor

    def create_db(self):
        conn, cursor = self.get_connection()

        for table_name, table_schema in self.DB_SCHEMA.items():
            create_table = f'CREATE TABLE IF NOT EXISTS {table_name}(\n'

            columns = [f'\t{col_name} {col_type}' for col_name, col_type in table_schema.items()]
            create_table += ",\n".join(columns)

            create_table += '\n)'
            # print('#########################[CREATE TABLE]#########################')
            # print(create_table)
            # print('################################################################')
            cursor.execute(create_table)

        cursor.close()
        conn.close()

    def get_columns(self, table):
        return list(self.DB_SCHEMA[table].keys())

    def insert_and_get(self, table, **col_name_value):
        data = tuple(col_name_value.values())
        keys = list(col_name_value.keys())
        columns = ",".join(keys)
        values = ",".join(['?' for _ in range(len(keys))])

        conn, cursor = self.get_connection()
        cursor.execute(f'insert into {table} ({columns}) values ({values})', data)
        conn.commit()

        data = cursor.execute(f'select * from {table} order by id desc limit 1').fetchone()
        cursor.close()
        conn.close()

        return data

    def update(self, table, id, **col_name_value):
        conn, cursor = self.get_connection()
        columns = ",".join([f'{column} = ?' for column in col_name_value.keys()])
        values = list(col_name_value.values())
        values.append(id)

        cursor.execute(f'update {table} set {columns} where id = ?', tuple(values))
        conn.commit()

        data = cursor.execute(f'select * from {table} where id = ?', (id,)).fetchone()
        cursor.close()
        conn.close()

        return data

    def delete(self, table, id):
        conn, cursor = self.get_connection()
        cursor.execute(f'delete from {table} where id = ?', (id,))
        conn.commit()

        found = cursor.execute(f'select id from {table} where id = ?', (id,)).fetchone()
        cursor.close()
        conn.close()

        return 1 if found is None else 0

    def delete_many(self, table, where_condition, data=tuple()):
        try:
            conn, cursor = self.get_connection()
            cursor.execute(f'delete from {table} where {where_condition}', data)
            conn.commit()
            return 1
        except:
            return 0

    def select(self, query, params):
        conn, cursor = self.get_connection()
        cursor.execute(query, params)
        res = cursor.fetchall()
        cursor.close()
        conn.close()

        if res:
            if len(res) == 1 and ('limit 1' in query or 'where id' in query):
                return res[0]
            else:
                return res

        return None

    def all(self, table):
        return self.select(f'select * from {table}', ())

    """""""""""""""""""""""""""""""""""""""""""""""
		Specific Methods
	"""""""""""""""""""""""""""""""""""""""""""""""

    def do_stuff(self):
        pass
