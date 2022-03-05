import argparse
import os
import re

import numpy as np
import pandas as pd
import torch
from deeppavlov import build_model, configs
from deeppavlov.core.common.file import read_json

# убрал import telebot

dir_path = os.path.dirname(os.path.realpath(__file__))

parser = argparse.ArgumentParser()

parser.add_argument('path', type=str)

args = parser.parse_args()
src = args.path


model = torch.load(dir_path+"/tariff_model.pt")


bert_config = read_json(configs.embedder.bert_embedder)
bert_config['metadata']['variables']['BERT_PATH'] = dir_path + \
    '/sentence_ru_cased_L-12_H-768_A-12_pt'  # изменил путь

m = build_model(bert_config)


def predict(data, model):
    model.eval()
    probs = model(data)
    res = torch.argmax(probs, axis=1)
    return res


def process(path):
    vocab = "ЁЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮёйцукенгшщзхъфывапролджэячсмитьбю!?,"
    data = pd.read_csv(path, encoding='windows-1251', sep=";")
    data = data.dropna()
    ru = []
    for i in range(len(data["CONTENT"].values)):
        s = data["CONTENT"].values[i]
        if "а" in s or "б" in s or "в" in s or "г" in s or "д" in s or "е" in s or "з" in s:
            ru.append(i)
    data_ru = data.iloc[ru]
    сontent = np.array(data_ru["CONTENT"].values)
    clean_ru = []
    for j in data_ru["CONTENT"].values:
        for i in j:
            if(i not in vocab):
                j = j.replace(i, ' ')
        j = re.sub(" +", " ", j)
        clean_ru.append(j)
    return clean_ru, сontent


clean_ru, content = process(src)
X = []
Y = []
for i in range(len(clean_ru)//20+1):
    try:
        X.append(m(clean_ru[i*20:(i+1)*20])[5])
        Y.append(content[i*20:(i+1)*20])
    except:
        continue
X = torch.tensor(np.concatenate(X))
Y = np.concatenate(Y)
pred = predict(X, model).numpy()
res = pd.DataFrame()
res["CONTENT"] = Y
res["TARIFF"] = pred
name = dir_path+"/Res/ans.csv"
res.to_csv(name, encoding='windows-1251', sep=";", index=False)
# os.remove(src)

