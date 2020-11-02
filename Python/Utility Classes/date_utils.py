from datetime import datetime, timedelta
from typing import List

"""
    Date Utility Functions
"""


def now() -> datetime:
    """
    Get current time & date
    """
    return datetime.now()


def date2str(date: datetime, date_format='%Y-%m-%d') -> str:
    """
    Convert date to string
    """
    return date.strftime(date_format)


def str2date(date: str, date_format='%Y-%m-%d') -> datetime:
    """
    Convert string to date
    """
    return datetime.strptime(date, date_format)


def date_range(date: str, date_format='%Y-%m-%d', range_before=1, range_after=1) -> List[datetime]:
    """
    Get a range of dates bases on a specified date
    """
    date = str2date(date, date_format)
    before_range = [(date - timedelta(days=range_before - i)) for i in range(range_before)]
    after_range = [(date + timedelta(days=i + 1)) for i in range(range_after)]
    return [
        *before_range,
        date,
        *after_range
    ]


def change_format(date, from_format='%Y-%m-%d', to_format='%Y-%m-%d'):
    """
    change the format of a date \n
    *Note: from_format is None if date provided is of type datetime
    """
    if isinstance(date, str):
        return date2str(str2date(date, from_format), to_format)
    elif isinstance(date, datetime):
        return date2str(date, to_format)
