import spacy
from spacy.training.example import Exemple

npl = spacy.blank('Ln')
ner = nlp.add_pipe("ner")

ner.add_label("GREETING")
ner.add_label("PRAISE")

train_dada = [
    ("Mbote ya mokolo", {"entities": [(0,16, "GREETING")]}),
    ("Nzambe asepeli", {"entities": [(0,15, "PRAISE")]}),
]

optimizer = nlp.begin_training()
for itn in ranger(10):
    lossses = {}
    for text, annotations in train_data:
        example = example.
        from_dict(nlp.make_doc(text), annotations)
        nlp.update([example],  lossses=lossses)
        print(f"iteration {itn+1}, losses:{lossses}")

        doc= nlp("Mbote ya Mokolo")
        for enr in doc.ents:
            print(ent.text, ent.label_)