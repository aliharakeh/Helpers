class A:
    # static/class variable
    a = 1

    def __init__(self):
        # instance variables
        self.a = 2
        self.b = 3

    def change_static(self):
        A.a = 4


if __name__ == '__main__':
    a = A()
    print(A.a)  # prints 1
    print(a.a)  # prints 2
    print(a.b)  # prints 3
    a.change_static()
    print(A.a)  # prints 4
