import math


def gini(positive_count, negative_count):
    probs = [
        positive_count / (positive_count + negative_count),
        negative_count / (positive_count + negative_count)
    ]
    result = 1
    for prob in probs:
        if prob:
            result -= pow(prob, 2)
    print('gini = {}'.format(result))
    return result


def gini_split(probs, counts):
    total = probs[0] + probs[1]
    result = (probs[0] / total) * gini(counts[0], counts[1]) + (probs[1] / total) * gini(counts[2], counts[3])
    print(f'gini split = {result}')
    return result


def entropy(positive_count, negative_count):
    probs = [
        positive_count / (positive_count + negative_count),
        negative_count / (positive_count + negative_count)
    ]
    result = 0
    for prob in probs:
        if prob:
            result -= prob * math.log(prob, 2)
    print('entropy = {}'.format(result))
    return result


def information_gain(probabilities, overall_probs):
    info_gain = 0
    total_count = 0
    for item in probabilities:
        total_count += item[0]

    for item in probabilities:
        info_gain += (item[0] / total_count) * entropy(item[1], item[2])

    overall_entropy = entropy(*overall_probs)

    print(f'Information Gain = {overall_entropy - info_gain}')


def euclidean_distance(A, B):
    res = pow((A[0] - B[0]), 2) + pow((A[1] - B[1]), 2)
    print(math.sqrt(res))


if __name__ == '__main__':
    # gini(2, 3)
    # entropy(2, 3)

    # probs = [1, 9]  # [positive count, negative count]
    # counts = [0, 1, 3, 6]  # [pos1, neg1, pos2, neg2]
    # gini_split(probs, counts)

    # probabilities = [
    #     [5, 3, 2],  # [class count , class positive count, class negative count]
    #     [4, 4, 0],
    #     [5, 3, 2],
    # ]
    # overall_probs = [9, 5]  # [positive, negative]
    # information_gain(probabilities, overall_probs)

    # euclidean_distance([5, 4], [3, 4])
    # res = (math.sqrt(2) + math.sqrt(17) + 2 + math.sqrt(5)) / 4
    print(math.sqrt(2))
    print(2)
    print(math.sqrt(5))
    print(math.sqrt(10))
    print(math.sqrt(13))
    print(math.sqrt(17))

    # entropy(3, 2)
    # probabilities = [
    #     [5, 3, 2],  # [class count , class positive count, class negative count]
    #     [5, 2, 3],
    # ]
    # overall_probs = [5, 5]  # [positive, negative]
    # information_gain(probabilities, overall_probs)