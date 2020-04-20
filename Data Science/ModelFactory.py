from sklearn.metrics import accuracy_score, roc_auc_score, roc_curve, confusion_matrix, plot_confusion_matrix
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from imblearn.under_sampling import NearMiss, ClusterCentroids, RandomUnderSampler, TomekLinks, EditedNearestNeighbours, \
    NeighbourhoodCleaningRule


class ModelFactory:
    model = None
    x_train, y_train, x_test, y_test, y_predict = None, None, None, None, None

    def __init__(self, model):
        self.model = model

    def data_split(self, x, y, params):
        self.x_train, self.x_test, self.y_train, self.y_test = train_test_split(x, y, **params)

    def plot_roc_curve(self, fpr, tpr):
        plt.plot(fpr, tpr, color='orange', label='ROC')
        plt.plot([0, 1], [0, 1], color='darkblue', linestyle='--')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristics (ROC) Curve')
        plt.legend()
        plt.show()

    def show_confusion_matrix(self):
        print('Confusion Matrix')
        print(confusion_matrix(self.y_test, self.y_predict))
        print('---------------------------------------------')
        plot_confusion_matrix(self.model, self.x_test, self.y_test, labels=[0, 1])

    def apply_classifier(self):
        # fit the model
        self.model.fit(self.x_train, self.y_train)

        # predict the outcome
        self.y_predict = self.model.predict(self.x_test)

        # get the accuracy score
        print(f'accuracy_score: {accuracy_score(self.y_test, self.y_predict)}')

        # get the probabilities
        probs = self.model.predict_proba(self.x_test)  # 2D array of each model's probability
        needed_probs = probs[:, 1]  # 2nd column probability is considered as the prediction

        # get the auc score
        auc_score = roc_auc_score(self.y_test, needed_probs)
        print('AUC: %.2f' % auc_score)

        fpr, tpr, thresholds = roc_curve(self.y_test, needed_probs)
        self.plot_roc_curve(fpr, tpr)

    def under_sampling(self, method, x, y):
        methods = {
            'RandomUnderSampler': {
                'resampler': RandomUnderSampler,
                'sampling_strategy': None
            },
            'NearMiss': {
                'resampler': NearMiss,
                'sampling_strategy': "not minority"
            },
            'TomekLinks': {
                'resampler': TomekLinks,
                'sampling_strategy': "majority"
            },
            'ClusterCentroids': {
                'resampler': ClusterCentroids,
                'sampling_strategy': "auto"
            },
            'ENN': {
                'resampler': EditedNearestNeighbours,
                'sampling_strategy': "majority"
            },
            'NCR': {
                'resampler': NeighbourhoodCleaningRule,
                'sampling_strategy': "majority"
            },
        }
        resampler = methods[method]['resampler']
        strategy = methods[method]['sampling_strategy']
        if strategy:
            resampler = resampler(sampling_strategy=strategy)
        else:
            resampler = resampler()

        resampled_x_train, resampled_y_train = resampler.fit_sample(x, y)
        print(f'x_train: {len(x)}')
        print(f'resampled_x_train: {len(resampled_x_train)}')

        return resampled_x_train, resampled_y_train
