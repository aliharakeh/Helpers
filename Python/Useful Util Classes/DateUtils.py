from datetime import datetime

DATE_FORMAT = '%d-%m-%Y %I:%M:%S %p'


class DateUtils:

    @staticmethod
    def now():
        now = datetime.now()
        return now.strftime(DATE_FORMAT)

    @staticmethod
    def compare_dates(date_a_str: str, date_b_str: str, date_format: str = DATE_FORMAT):
        date_a = DateUtils.get_date(date_a_str, date_format)
        date_b = DateUtils.get_date(date_b_str, date_format)
        print(date_a_str, date_b_str, f'date_a <= date_b = {date_a <= date_b}', sep=' / ')
        return date_a <= date_b

    # To sort string dates use:
    # -------------------------
    # * Ascending Order --> list.sort(key=lambda item: DateUtils.get_date(item['date']))
    # * Add `reversed=True` for Descending Order
    @staticmethod
    def get_date(date: str, date_format: str = DATE_FORMAT):
        return datetime.strptime(date, date_format)


if __name__ == '__main__':
    DateUtils.compare_dates('1-3-2020', '1-2-2020', date_format='%d-%m-%Y')
    DateUtils.compare_dates('1-6-2020 12:02:30 AM', '1-6-2020 12:02:29 AM')
