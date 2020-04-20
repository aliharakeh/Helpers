if __name__ == '__main__':
    """
    * dir([object])
    - Without arguments, return the list of names in the current local scope. 
    - With an argument, attempt to return a list of valid attributes for that object.
    """
    print(dir('string'))

    """
    * enumerate(iterable, start=0) -> iterator
    - Return an enumerate object. iterable must be a sequence, an iterator, or some other object which supports iteration.
    """
    print(list(enumerate(['a', 'b', 'c', 'd'])))

    """
    * eval(expression[, globals[, locals]])
    - The arguments are a string and optional globals and locals. If provided, globals must be a dictionary. 
    - If provided, locals can be any mapping object.
    """
    x = 2
    print(eval('x+1'))
    eval('print("eval print")')
    eval('print("x is 2") if x == 2 else print("x is not 2")')

    # ERROR - doesn't work
    # eval('x = 1')
    # print(x)
    # eval('if x == 2: print("x is 2") else: print("x is not 2")')

    """
    * exec(object[, globals[, locals]])
    - This function supports dynamic execution of Python code.
    """
    exec('x = 3')
    print(f'x is now {x}')

    """
    * filter(function, iterable) -> iterator
    - Construct an iterator from those elements of iterable for which function returns true.
    - Note that filter(function, iterable) is equivalent to the generator expression 
      (item for item in iterable if function(item)) if function is not None and (item for item in iterable if item) 
      if function is None.
    """
    _filter = filter(lambda x: x % 2 == 0, [1, 2, 3, 4, 5, 6])
    print(list(_filter))

    """
    * getattr(object, name[, default])
    - Return the value of the named attribute of object. name must be a string. 
    - If the string is the name of one of the object’s attributes, the result is the value of that attribute. 
    - For example, getattr(x, 'foobar') is equivalent to x.foobar. If the named attribute does not exist, default 
      is returned if provided, otherwise AttributeError is raised.
    """
    attr = getattr(str, 'split')
    print(attr)

    """
    * help([object])
    - Invoke the built-in help system.
    """
    help(str)

    # interactive help system in console - type the object to get it's help
    # help()

    """
    * isinstance(object, classinfo)
    - Return True if the object argument is an instance of the classinfo argument, or of a (direct, indirect or virtual) 
      subclass thereof. If object is not an object of the given type, the function always returns False. 
    - If classinfo is a tuple of type objects (or recursively, other such tuples), return True if object is an instance 
      of any of the types. 
    - If classinfo is not a type or tuple of types and such tuples, a TypeError exception is raised.
    """
    print(isinstance('string', str))

    """
    * map(function, iterable, ...) -> iterator
    - Return an iterator that applies function to every item of iterable, yielding the results. 
    - If additional iterable arguments are passed, function must take that many arguments and is applied to the items 
      from all iterables in parallel. With multiple iterables, the iterator stops when the shortest iterable is exhausted. 
    - For cases where the function inputs are already arranged into argument tuples, see itertools.starmap().
    """
    _map = map(lambda x: x * 2, [1, 2, 3, 4, 5, 6])
    print(list(_map))

    """
    * reversed(seq) -> iterator
    - Return a reverse iterator. seq must be an object which has a __reversed__() method or supports the sequence 
      protocol (the __len__() method and the __getitem__() method with integer arguments starting at 0).
    """
    _reversed = reversed([1, 2, 3, 4])
    print(list(_reversed))

    """
    * sorted(iterable, *, key=None, reverse=False)
    - Return a new sorted list from the items in iterable.
    - key specifies a function of one argument that is used to extract a comparison key from each element in iterable 
      (for example, key=str.lower). The default value is None (compare the elements directly).
    - reverse is a boolean value. If set to True, then the list elements are sorted as if each comparison were reversed.
    """
    _sorted = sorted([1, 4, 3, 2])
    print(list(_sorted))

    _sorted = sorted([dict(y=2, x=1), dict(y=3, x=5), dict(y=1, x=6)], key=lambda item: item['y'])
    print(list(_sorted))

    """
    * zip(*iterables)
    - Make an iterator that aggregates elements from each of the iterables.
    - Returns an iterator of tuples, where the i-th tuple contains the i-th element from each of the argument 
      sequences or iterables. 
    - The iterator stops when the shortest input iterable is exhausted. 
    - With a single iterable argument, it returns an iterator of 1-tuples. With no arguments, it returns an empty 
      iterator.
    """
    for a, b in zip([1, 2, 3, 4], [1, 2, 3]):
        print(f'a={a}, b={b}')
