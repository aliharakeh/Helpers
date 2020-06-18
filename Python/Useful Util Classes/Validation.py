import re


class ValidationRules:
    """
        Some Terms:
        -----------
        lt: less than
        gt: greater than
        eq: equal
    """
    dict = None

    def __init__(self):
        self.dict = {
            'length': self.same_length,
            'min_length': self.gt_or_eq_to_min_length,
            'max_length': self.lt_or_eq_to_max_length,
            'range_length': self.in_range_length,
            'max_val': self.value_lt_or_eq_max,
            'min_val': self.value_gt_or_eq_min,
            'range_val': self.value_in_range,
            'pattern': self.pattern_match,
            'allowed_file': self.allowed_file
        }

    def same_length(self, value, length):
        return len(value) == length

    def lt_or_eq_to_max_length(self, value, length):
        return len(value) <= length

    def gt_or_eq_to_min_length(self, value, length):
        return len(value) >= length

    def in_range_length(self, value, min, max):
        return (
                self.gt_or_eq_to_min_length(value, min)
                and
                self.lt_or_eq_to_max_length(value, max)
        )

    def value_in_range(self, value, min, max):
        return min <= value <= max

    def value_lt_or_eq_max(self, value, max):
        return value <= max

    def value_gt_or_eq_min(self, value, min):
        return value >= min

    def pattern_match(self, value, pattern):
        return re.search(rf'{pattern}', value) is not None

    def allowed_file(self, filename, allowed_extensions):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


class Validator:
    _validation_rules = ValidationRules()

    @staticmethod
    def validate(value, validation_rules):
        """
            This function accepts a value and a dictionary of rules

            Rules List:
            -----------
            string
            ------
            length -> number, example: {'length': 10}
            max_length -> number, example: {'max_length': 10}
            min_length -> number, example: {'min_length': 1}
            range_length -> list[number(min), number(max)], example: {'range_length': [1, 10]}

            number
            ------
            max_val -> number, example: {'max_val': 10}
            min_val -> number, example: {'min_val': 1}
            range_val -> list[number(min), number(max)], example: {'range_val': [1, 10]}

            any pattern
            -----------
            pattern -> string, example: {'pattern': '[a-z]+'}

            Full Example:
            -------------
                rules = {
                    'range_length': [1, 10],
                    ''
                }
                value = <any-value>
                Validator.validate(value, rules)
        """
        ok = True
        for key, params in validation_rules.items():
            if isinstance(params, list):
                ok = (Validator._validation_rules.dict[key])(value, *params)
            else:
                ok = (Validator._validation_rules.dict[key])(value, params)
            if not ok:
                break
        return ok

    @staticmethod
    def validate_multiple(validation_data):
        """
        This function accepts a dictionary with both values and their validation rules.
        Any validation error in any part of the data will return an overall failed validation

        NOTE: Refer to Validator.validate() for the validation rules

        example:
        -------
        validation_data =  [
            {
                'value': value1,
                'rules: {'length': 10}
            },
            {
                'value': value1,
                'rules: {'length': 10}
            }
            ....
        ]
        """
        # TODO: iterate the validation_data and validate each value
        for validation in validation_data:
            ok = Validator.validate(validation['value'], validation['rules'])
            if not ok:
                return False
        return True

    @staticmethod
    def validate_and_get_accepted(validation_dict):
        """
        Example
        --------
        {
            'required': [
                {
                    'key': 'title',
                    'value' title,
                    'rules': {'length': 10},
                    'error': 'Title must be bla bla bla'
                },
                ....
            ]
            'optional': [
                ...
            ]
        }

        result
        ------
        data = {
            'title': title
        }
        OR
        ==
        {
            'error': 'Title must be bla bla bla'
        }
        """
        # TODO: get required and optional data
        required = validation_dict['required']
        optional = validation_dict['optional']

        # TODO: initialize data
        data = {}

        # TODO: iterate through required data and validate it
        for item in required:
            # TODO: return error if there is no value
            if not item['value']:
                return {
                    'error': item['error']
                }

            # TODO: validate
            ok = Validator.validate(item['value'], item['rules'])

            # TODO: return error if validation failed
            if not ok:
                return {
                    'error': item['error']
                }

            # TODO: add accepted value to data
            data[item['key']] = item['value']

        # TODO: iterate through optional data and validate it
        for item in optional:
            # TODO: validate if there is data
            if item['value']:

                # TODO: validate
                ok = Validator.validate(item['value'], item['rules'])

                # TODO: return error if validation failed
                if not ok:
                    return {
                        'error': item['error']
                    }

                # TODO: add accepted value to data
                data[item['key']] = item['value']

        # TODO: return accepted data
        return data


if __name__ == '__main__':
    data = Validator.validate_and_get_accepted({
        'required': [
            {
                'key': 'key1',
                'value': 'value1',
                'rules': {
                    'pattern': r'\d'
                },
                'error': 'error msg'
            }
        ],
        'optional': [
            {
                'key': 'key2',
                'value': 1,
                'rules': {
                },
                'error': 'error msg'
            }
        ]
    })

    print(data)
