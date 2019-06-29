import sqlite3


class SqlLiteManager:
	DB_SCHEMA = None
	DB_PATH = None

	"""""""""""""""""""""""""""""""""""""""""""""""
		Initialization
	"""""""""""""""""""""""""""""""""""""""""""""""

	def __init__(self, db_path, db_schema):
		self.DB_PATH = db_path
		self.DB_SCHEMA = db_schema

	"""""""""""""""""""""""""""""""""""""""""""""""
		General Methods
	"""""""""""""""""""""""""""""""""""""""""""""""

	def get_connection(self):
		conn = sqlite3.connect(self.DB_PATH)
		cursor = conn.cursor()
		return conn, cursor

	def create_table(self):
		conn, cursor = self.get_connection()

		for table_name, table_schema in self.DB_SCHEMA.items():
			create_table = f'CREATE TABLE IF NOT EXISTS {table_name}(\n'

			columns = [f'\t{col_name} {col_type}' for col_name, col_type in table_schema.items()]
			create_table += ",\n".join(columns)

			create_table += '\n)'
			print('#########################[CREATE TABLE]#########################')
			print(create_table)
			print('################################################################')
			cursor.execute(create_table)

		cursor.close()
		conn.close()

	def get_columns(self, table):
		return list(self.DB_SCHEMA[table].keys())

	def insert_and_get_id(self, table, **col_name_value):
		data = tuple(col_name_value.values())
		keys = list(col_name_value.keys())
		columns = ",".join(keys)
		values = ",".join(['?' for _ in range(len(keys))])

		conn, cursor = self.get_connection()
		cursor.execute(f'insert into {table} ({columns}) values ({values})', data)
		conn.commit()

		last_id = cursor.execute(f'select id from {table} order by id desc limit 1').fetchone()[0]
		cursor.close()
		conn.close()

		return str(last_id)

	def update(self, table, id, **col_name_value):
		conn, cursor = self.get_connection()

		columns = ",".join([f'{column} = ?' for column in col_name_value.keys()])
		values = list(col_name_value.values())
		values.append(id)

		cursor.execute(f'update {table} set {columns} where id = ?', tuple(values))
		conn.commit()

		cursor.close()
		conn.close()

	def delete(self, table, id):
		conn, cursor = self.get_connection()
		cursor.execute(f'delete from {table} where id = ?', (id,))
		conn.commit()
		cursor.close()
		conn.close()

	def select(self, query):
		conn, cursor = self.get_connection()
		cursor.execute(query)
		res = cursor.fetchall()
		cursor.close()
		conn.close()
		if len(res) == 1 and ('limit 1' in query or 'where id' in query):
			return res[0]
		else:
			return res

	def all(self, table):
		return self.select(f'select * from {table}')

	"""""""""""""""""""""""""""""""""""""""""""""""
		Specific Methods
	"""""""""""""""""""""""""""""""""""""""""""""""

	def get_anime_list(self):
		anime_list = {
			'monday': [],
			'tuesday': [],
			'wednesday': [],
			'thursday': [],
			'friday': [],
			'saturday': [],
			'sunday': []
		}

		data = self.select('select * from anime_list')
		for row in data:
			anime_list[row[3].lower()].append([str(row[0]), row[1], str(row[2]), row[3], row[4]])

		return anime_list
