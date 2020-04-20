from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

Session = sessionmaker()


@contextmanager
def session_scope(commit=True):
    """Provide a transactional scope around a series of operations."""
    session = Session()
    try:
        yield session
        if commit:
            session.commit()
    except Exception as e:
        print(e)
        if commit:
            session.rollback()
        raise
    finally:
        session.close()


"""
    Testing some stuff
"""


@contextmanager
def a():
    try:
        yield 'First --> yield'
        print('Second --> try')
    except Exception as e:
        print('Second --> except')
        raise
    finally:
        print('Third --> finally')


def test_context():
    with a() as b:
        print(b)
        return 'Fourth --> function return'


if __name__ == '__main__':
    print(test_context())
