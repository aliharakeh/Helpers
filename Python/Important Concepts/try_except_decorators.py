import functools
import traceback


def try_except(error_msg=None, on_fail_val=False, with_traceback=False):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # try calling the wrapped function
            try:
                return func(*args, **kwargs)

            # Show what went wrong in the function
            except Exception as e:
                # print error message or value
                print(f'[Exception Message/Value]: {e}')

                # print error traceback
                if with_traceback:
                    print('[TraceBack]')
                    traceback.print_tb(e.__traceback__)

                # print custom error message
                if error_msg:
                    print(f'[Error]: {error_msg}')

                # return a default value on error
                return on_fail_val

        return wrapper

    return decorator
