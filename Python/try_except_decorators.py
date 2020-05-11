import functools


def try_except(error_msg, on_fail_val=False):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print(f'[Exception]: {e}')
                print(f'[Error]: {error_msg}')
                return on_fail_val

        return wrapper

    return decorator
