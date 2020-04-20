from datetime import datetime


class DateUtils:
    @staticmethod
    def now():
        now = datetime.now()
        return now.strftime('%d-%m-%Y %I:%M:%S %p')
