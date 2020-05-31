from datetime import datetime


class DateUtils:
    DATE_FORMAT = '%d-%m-%Y %I:%M:%S %p'

    @staticmethod
    def now():
        now = datetime.now()
        return now.strftime(DateUtils.DATE_FORMAT)

    @staticmethod
    def compare_dates(date_a: str, date_b: str):
        date_a = DateUtils.get_date(date_a)
        date_b = DateUtils.get_date(date_b)
        print(date_a, date_b, f'date_a < date_b = {date_a < date_b}', sep=' / ')
        return date_a < date_b

    # To sort string dates use:
    # -------------------------
    # * Ascending Order --> list.sort(key=lambda item: DateUtils.get_date(item['date']))
    # * Add `reversed=True` for Descending Order
    @staticmethod
    def get_date(date: str):
        return datetime.strptime(date, DateUtils.DATE_FORMAT)
