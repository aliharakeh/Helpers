from Language.lebanese_to_arabic import LebaneseToArabic
from Language.lebanese_to_english import LebaneseToEnglish

if __name__ == '__main__':
    texts = [
        # 'wasfi men edoctoor',
        # 'eh walla nsab bl marad',
        # 'kn mnsab bas sa7 halla2',
        'mr7aba',
        '2hla',
        '2hwe',
        'msebe',
    ]
    lb_en = LebaneseToEnglish()
    for text in texts:
        print("Mapping", text, '==>', lb_en.lb_ar.map_lb_to_ar(text))
        print("AR", text, '==>', lb_en.lb_ar.lb_to_ar(text))
        print("EN", text, '==>', lb_en.lb_to_ar_to_en(text))
        print('-----------------------------------------------------')
