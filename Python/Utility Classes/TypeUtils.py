class TypeCheck:

    @staticmethod
    def print_type(value):
        print(type(value))

    @staticmethod
    def check_type(value, _type):
        if not isinstance(value, _type):
            raise TypeError(f'Type should be {_type} while {type(value)} was given')
